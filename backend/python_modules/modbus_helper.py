from apscheduler.schedulers.background import BackgroundScheduler
import python_modules.logfo as logfo
import python_modules.sql_handler as sql_handler
import python_modules.time_helper as time_helper
import pprint, pprint, serial, time, random
from threading import Thread
from python_modules.filepaths import *
from python_modules.constants import *


class Modbus:
    def __init__(self):
        self.daemon = Thread(
            target=self._looper, args=(), daemon=True, name="Modbus Looper"
        )
        self.data_ready = False
        self.data_buffer = {}  #### current data of the device
        self.final_data = {}  #### final sending data buffer
        self.schedular_map = []  #### init in line 329 of app.py
        self.running_tank = None  #### keeps track of currently running tank (self.running_tank == device id in meter_config.json)
        self.valve_status = 0  #### keeps track of temp valve status
        self.switching_seq = (
            0  #### interrupt to stop data loading when switching takes place.
        )
        self.retry = 0
        self.mock_mode = MOCK_MODE  #### mock data
        self.errors = []
        self.running = False
        self.connected = False

    def set_config(self, comport, baud):
        self.comport = comport
        self.baudrate = baud
        self.ser = serial.Serial()
        self.daemon.start()

    def stop_serial(self):
        self.running = False
        self.connected = False
        try:
            self.ser.close()
            logfo.logs("MODBUS", "Closed: ", self.ser.port)
            return True
        except Exception as e:
            logfo.loge("MODBUS", "Error closing port: ", str(e), send_log=True)
            raise Exception(e)

    def start_serial(self):
        if self.connected:
            return True
        try:
            self.ser.baudrate = self.baudrate
            self.ser.port = self.comport
            # self.ser.port = "COM" + self.comport
            self.ser.timeout = 1
            self.ser.parity = serial.PARITY_NONE
            self.ser.stopbits = serial.STOPBITS_ONE
            self.ser.bytesize = serial.EIGHTBITS
            self.ser.write_timeout = 1
            logfo.logi("MODBUS-STATUS", "Opening port: ", self.ser.port, send_log=True)
            self.ser.open()
            logfo.logs("MODBUS-STATUS", "Port Opened", send_log=True)
            self.connected = True
        except Exception as ex:
            try:
                self.ser.inWaiting()
                logfo.logw(
                    "MODBUS-STATUS", "Port open with err: ", str(ex), send_log=True
                )
                self.connected = True
                return True
            except Exception as e:
                if self.ser.is_open:
                    self.ser.close()
                logfo.loge(
                    "MODBUS-STATUS", "Error opening port: ", str(e), send_log=True
                )
                self.connected = False
                raise Exception(e)

    def read_modbus(
        self,
        device_id,
        ad_lo,
        qty_lo,
        ad_hi=0,
        func=0x03,
        qty_hi=0,
        check_inp_out=False,
    ):
        # Prepare request
        time.sleep(0.2)
        FUNC = func
        starting_ad_hi = ad_hi
        starting_ad_lo = ad_lo
        qty_hi = qty_hi
        qty_lo = qty_lo
        data = [device_id, FUNC, starting_ad_hi, starting_ad_lo, qty_hi, qty_lo]
        crc_low, crc_high = self.cal_checksum_func(data)
        data.append(crc_high)
        data.append(crc_low)
        ## Read Request
        RECV_LEN = (qty_lo * 2) + 5 if func == 3 else 8
        sched_map = [d for d in self.schedular_map if d["id"] == device_id][0]
        ind = self.schedular_map.index(sched_map)
        try:
            self.ser.flushInput()
            self.ser.flushOutput()
            logfo.logi("MODBUS-STATUS", "polling: ", device_id, end=" ")
            self.ser.write(data)
            # self.ser.flush()
            time.sleep(MODBUS_WAIT_TIME)
            bytes_rec = self.ser.read(RECV_LEN)
            self.retry = 0
            
            sched_map["polling_status"] = True
            self.schedular_map[ind] = sched_map
        except Exception as e:
            sched_map["polling_status"] = False
            self.schedular_map[ind] = sched_map
            
            logfo.loge(
                "MODBUS-STATUS",
                "Device Not working",
                str(device_id),
                "Device not working.",
                send_log=True,
            )

            no_polling_statuses = not any(
                d["polling_status"] for d in self.schedular_map
            )
            if no_polling_statuses:
                self.retry = self.retry + 1
                logfo.loge(
                    "MODBUS-STATUS",
                    "error reading: ",
                    str(e),
                    "Running and restarting Serial. Retrying: ",
                    send_log=True,
                )
                try:
                    self.stop_serial()
                    self.start_serial()
                    if self.retry > GLOBAL_RETRY_LIMIT:
                        self.retry = 0
                        raise Exception("Error")
                    self.running = True
                except Exception as e:
                    logfo.loge(
                        "SERIAL-STATUS",
                        "Serial Disconnect. Restart Software.",
                        send_log=True,
                    )
                    exit()
                    
            return None

        if len(bytes_rec) != RECV_LEN:
            if len(bytes_rec) == 0:
                logfo.loge(
                    "MODBUS-STATUS",
                    "DEVICE ID",
                    str(device_id),
                    "Device non communicable. No data received.",
                    send_log=True,
                )
            else:
                logfo.loge("MODBUS-STATUS", "wrong length in modbus read. ")

            return None

        if not self.checksum_func(bytes_rec):
            logfo.loge("MODBUS-STATUS", "checksum error")
            return None

        if check_inp_out:
            return len(data) == len(bytes_rec)

        vals = self.compute_uint(bytes_rec)
        logfo.logs("MODBUS-STATUS", "Got:", vals)
        return vals

    def checksum_func(self, arr):
        checksum = 0xFFFF
        for num in range(0, len(arr) - 2):
            lsb = arr[num]
            checksum = checksum ^ lsb
            for count in range(1, 9):
                lastbit = checksum & 0x0001
                checksum = checksum >> 1
                if lastbit == 1:
                    checksum = checksum ^ 0xA001

        lowCRC = checksum >> 8
        checksum = checksum << 8
        highCRC = checksum >> 8
        return lowCRC & 0xFF == arr[-1] and highCRC & 0xFF == arr[-2]

    def cal_checksum_func(self, arr):
        checksum = 0xFFFF
        for num in range(0, len(arr)):
            lsb = arr[num] % 256
            checksum = checksum ^ lsb
            for count in range(1, 9):
                lastbit = (checksum & 0x0001) % 256
                checksum = checksum >> 1

                if lastbit == 1:
                    checksum = checksum ^ 0xA001

        lowCRC = (checksum >> 8) % 256
        checksum = checksum << 8
        highCRC = (checksum >> 8) % 256

        return lowCRC, highCRC

    def compute_uint(self, bytes_rec):
        data = []
        bytes_rec = list(bytes_rec)
        bytes_rec = bytes_rec[3:-2]
        for i in range(0, len(bytes_rec), 2):
            value = (bytes_rec[i] << 8) + bytes_rec[i + 1]
            data.append(value)
        return data

    def poll_all_n_insert(self):
        for schedular in self.schedular_map:
            if self.running and schedular["running_status"]:
                self.custom_mod_poll_n_insert(schedular["id"])

    def _looper(self):
        while True:
            try:
                if not self.mock_mode:
                    self.start_serial()
                if self.running:
                    self.poll_all_n_insert()
                else:
                    ## Correct serial port but not runnning at the moment
                    time.sleep(5)
            except Exception as e:
                time.sleep(5)

    def bool_process(self, val):
        """
        Toggles the data fetching process

        #### Args:
            * val (bool - Optional): to toggle the system

        #### Returns:
            * bool : new running val
        """
        ##### starts running the process
        if val == None:
            self.running = not self.running
        else:
            self.running = val

        return self.running

    def reset_to_default(self):
        pass

    def set_config_device(self, table):
        self.device_table = table

    def _get_sql_float(self, value, param):
        if not value:
            return False
        value = value[0][param]
        if isinstance(value, float):
            value = round(value, 3)
        return value

    def custom_mod_poll_n_insert(self, device_id):
        self.running_tank = device_id
        device_found = self.get_device(device_id=device_id)
        if not device_found:
            return
        sched_map = [d for d in self.schedular_map if d["id"] == device_id][0]
        samp_data = 0x02 * [4]
        results_evaluated = []
        device_comm_status = False
        if 'polling_type' in device_found and device_found['polling_type'] == "multiple" and 'multi_poll_config' in device_found:
            if not self.running:
                return
            ad_hi = device_found['multi_pol_config']["ad_hi"] if "ad_hi" in device_found['multi_pol_config'] else 0
            ad_lo = device_found['multi_pol_config']["ad_lo"]
            qty_lo = device_found['multi_pol_config']["qty_lo"]
            if self.mock_mode:
                data = [random.random() * 10]
            else:
                data = self.read_modbus(
                    device_id=device_id, ad_hi=ad_hi, ad_lo=ad_lo, qty_lo=qty_lo
                )

            if data == None:
                results_evaluated.append(None)
            else:
                device_comm_status = True
                for idx,param in enumerate(device_found["parameters"]):
                    rounded = round(data[idx] * param["multiplier"], 3)
                    results_evaluated.append(rounded)
        else:
            for param in device_found["parameters"]:
                if not self.running:
                    return
                ad_hi = param["ad_hi"] if "ad_hi" in param else 0
                ad_lo = param["ad_lo"]
                qty_lo = param["qty_lo"]
                if self.mock_mode:
                    data = [random.random() * 10]
                else:
                    data = self.read_modbus(
                        device_id=device_id, ad_hi=ad_hi, ad_lo=ad_lo, qty_lo=qty_lo
                    )

                if data == None:
                    results_evaluated.append(None)
                else:
                    device_comm_status = True
                    rounded = round(data[0] * param["multiplier"], 3)
                    results_evaluated.append(rounded)

        index = 0
        self.data_ready = False
        self.data_buffer = {}
        for param in device_found["parameters"]:
            self.data_buffer[param["name"]] = results_evaluated[index]
            index += 1

        ts = time_helper.get_timestamp()
        self.data_buffer["timestamp"] = ts
        self.data_buffer["running_status"] = sched_map["running_status"]
        self.data_buffer["comm_status"] = device_comm_status
        self.data_buffer["polling_status"] = sched_map["polling_status"]
        self.data_buffer["id"] = int(device_found["id"])
        self.data_buffer["name"] = device_found["name"]
        # self.switch_type_if_any(device_id)
        # self.special_checks_func(device_id)
        self.data_ready = True
        self.final_data[str(device_id)] = self.data_buffer
        sql_params = "SET "
        for param in device_found["parameters"]:
            sql_params += (
                "`" + param["name"] + "`" + "=" + str(results_evaluated.pop(0)) + ","
            )
        sql_params += (
            'timestamp="'
            + ts
            + '",'
            + 'unix_time="'
            + time_helper.get_unix_time()
            + '"'
        )
        # print("TIMESTAMP: ", timestamp)
        sql = "INSERT INTO `admin_database`.`{name}` {sql_param} ".format(
            name=f"{device_found['name']}-{device_found['id']}", sql_param=sql_params
        )
        
        if device_comm_status:
            sql_handler.getResult(sql)

    def switch_type_if_any(self, device_id):
        ### data buffer has latest data and final_data has prev data
        if not (self.final_data[str(device_id)]) or not (self.data_buffer):
            return
        if (
            self.data_buffer["Motor1 Status"]
            == self.final_data[str(device_id)]["Motor1 Status"]
            and self.data_buffer["Motor2 Status"]
            == self.final_data[str(device_id)]["Motor2 Status"]
        ):
            pass
        else:
            logfo.logw("Sequence Change", f"Switching from auto to manual")
            self.generate_log(
                id=f"switching-{device_id}",
                title="Sequence Change",
                description="Switching from auto to manual",
                error_type="warning",
            )
            sched_map = [d for d in self.schedular_map if d["id"] == device_id][0]
            ind = self.schedular_map.index(sched_map)
            self.data_buffer["switching_type"] = "manual"
            sched_map["switching_type"] = "manual"
            try:
                if sched_map["schedular_status"]:
                    sched_map["schedular"].shutdown(wait=True)
                    sched_map["schedular"] = BackgroundScheduler()
                    sched_map["schedular_status"] = False
            except Exception as e:
                print("Process stopped")

            self.schedular_map[ind] = sched_map

    def special_checks_func(self, device_id):
        sched_map = [d for d in self.schedular_map if d["id"] == device_id][0]
        if not sched_map["running_status"]:
            logfo.logi(
                f"Valve Status",
                f'Not running for {sched_map["name"]} because its turned off.',
            )
            return
        concerned_d_val = self.data_buffer["Temp."]
        dev = self.get_device(device_id=device_id)
        if concerned_d_val > dev["max_temp"]:
            self.run_temp_valve_off(device_id)
        elif concerned_d_val < dev["min_temp"]:
            self.run_temp_valve_on(device_id)

    def run_temp_valve_off(self, dev_id):
        if self.mock_mode:
            return
        flag = False
        sched_map = [d for d in self.schedular_map if d["id"] == dev_id][0]
        ind = self.schedular_map.index(sched_map)
        if sched_map["valve_status"]:
            for p in range(MAX_MODBUS_RETRY):
                try:
                    bool_val = self.read_modbus(
                        device_id=dev_id + 2,
                        func=0x05,
                        ad=0,
                        qty_lo=0,
                        qty_hi=0x00,
                        check_inp_out=True,
                    )
                    if bool_val:
                        data = self.read_modbus(
                            device_id=dev_id + 2, ad=0x00, qty_lo=0x02
                        )
                        if data and data[1] % 10 == 0:
                            flag = True
                            sched_map["valve_status"] = False
                            logfo.logs(
                                f"Valve Status",
                                f"Successfully Turned Off Valve: of tank with device_id :{dev_id} Failed",
                            )
                            self.delete_error(id=f'valve-{sched_map["name"]}')
                            break
                except Exception as e:
                    logfo.loge(f"Valve Status", e)

        if not flag:
            self.generate_log(
                id=f'valve-{sched_map["name"]}',
                title="Valve Error",
                description=f'Turning Off Valve of {sched_map["name"]} Failed',
            )
            logfo.loge(
                f"Valve Error",
                f"Turning Off Valve: of tank with device_id :{dev_id} Failed",
            )
        self.schedular_map[ind] = sched_map
        return

    def run_temp_valve_on(self, dev_id):
        if self.mock_mode:
            return
        flag = False
        sched_map = [d for d in self.schedular_map if d["id"] == dev_id][0]
        ind = self.schedular_map.index(sched_map)
        if not sched_map["valve_status"]:
            for p in range(MAX_MODBUS_RETRY):
                try:
                    bool_val = self.read_modbus(
                        device_id=dev_id + 2,
                        func=0x05,
                        ad=0,
                        qty_lo=0,
                        qty_hi=0xFF,
                        check_inp_out=True,
                    )
                    if bool_val:
                        data = self.read_modbus(
                            device_id=dev_id + 2, ad=0x00, qty_lo=0x02
                        )
                        if data and data[1] % 10 == 1:
                            flag = True
                            sched_map["valve_status"] = True
                            logfo.logs(
                                f"Valve Status",
                                f"Successfully Turned On Valve: of tank with device_id :{dev_id} Failed",
                            )
                            self.delete_error(id=f'valve-{sched_map["name"]}')
                            break

                except Exception as e:
                    logfo.loge(f"Valve Status", e)
                    pass

        if not flag:
            self.generate_log(
                id=f'valve-{sched_map["name"]}',
                title="Valve Error",
                description=f'Turning On Valve of {sched_map["name"]} Failed',
            )
            logfo.loge(
                f"Valve Error",
                f"Turning Off Valve: of tank with device_id :{dev_id} Failed",
            )
        self.schedular_map[ind] = sched_map
        return

    def schedule_jobs(self, dev_id):
        dev = self.get_device(device_id=dev_id)
        if not dev:
            raise Exception("Not Found")
        sched_map = [d for d in self.schedular_map if d["id"] == dev_id][0]
        ind = self.schedular_map.index(sched_map)

        time_val = int(dev["def_time"])
        sched_map["schedular"].add_job(
            self.switch_seq, id="switch_seq", args=[dev_id, "init"]
        )
        sched_map["schedular"].add_job(
            self.switch_seq,
            "interval",
            seconds=time_val,
            id="switch_seq_interval",
            args=[dev_id, "later"],
        )
        sched_map["schedular"].start()
        sched_map["schedular_status"] = True

        self.schedular_map[ind] = sched_map

    def switch_seq(self, dev_id, flag):
        self.switching_seq = True
        if flag == "init":
            pass
        else:
            sched_map = [d for d in self.schedular_map if d["id"] == dev_id][0]
            self.turn_off_motor(sched_map["id"], sched_map["running_motor"])

        sched_map = [d for d in self.schedular_map if d["id"] == dev_id][0]
        self.turn_on_motor(sched_map["id"], sched_map["running_motor"])
        self.switching_seq = False

        return 1

    def generate_log(self, id, title, description, error_type="danger"):
        """
        error_type = danger,success,info,warning
        """
        icons = {
            "danger": "error",
            "success": "check",
            "info": "iInCircle",
            "warning": "warning",
        }
        self.errors.append(
            {
                "id": id,
                "title": title,
                "error_type": error_type if error_type != "info" else None,
                "description": description,
                "timestamp": time_helper.get_timestamp(),
                "icon": icons[error_type],
            }
        )

    def delete_error(self, id):
        check = [d for d in self.errors if d["id"] == id]
        if len(check):
            self.errors.remove(check[0])

    def turn_off_motor(self, device, motorNum):
        sched_map = [d for d in self.schedular_map if d["id"] == device][0]
        if self.mock_mode:
            return
        flag = False
        device_id_motor = device + motorNum
        for p in range(MAX_MODBUS_RETRY):
            logfo.logw(
                f"Motor Status. Try {p+1}",
                f"Turning Off motor: {motorNum + 1} of tank with device_id :{device}",
            )
            bool_val = self.read_modbus(
                device_id=device_id_motor,
                func=0x05,
                ad=0,
                qty_lo=0,
                qty_hi=0x00,
                check_inp_out=True,
            )
            if bool_val:
                data = self.read_modbus(device_id=device_id_motor, ad=0x00, qty_lo=0x04)
                if data and data[3] % 10 == 0:
                    flag = True
                    logfo.logs(
                        f"Motor Status. Try {p+1}",
                        f"Successfully Turned Off motor: {motorNum + 1} of tank with device_id :{device}",
                    )
                    if sched_map["running_motor"] == 0:
                        sched_map["running_motor"] = 1
                    else:
                        sched_map["running_motor"] = 0
                    self.delete_error(id=f"motor-{motorNum + 1}-{device}")
                    break

        if not flag:
            self.generate_log(
                id=f"motor-{motorNum + 1}-{device}",
                title="Motor Error",
                description=f"Turning Off motor: {motorNum + 1} of tank with device_id :{device} Failed",
            )
            logfo.loge(
                f"Motor Error.",
                f"Turning Off motor: {motorNum + 1} of tank with device_id :{device} Failed",
            )

    def turn_on_motor(self, device, motorNum):
        if self.mock_mode:
            return
        flag = False
        sched_map = [d for d in self.schedular_map if d["id"] == device][0]
        ind = self.schedular_map.index(sched_map)
        device_id_motor = device + motorNum
        for p in range(MAX_MODBUS_RETRY):
            logfo.logw(
                f"Motor Status, Try {p+1}",
                f"Turning On motor: {motorNum + 1} of tank with device_id :{device}",
            )
            bool_val = self.read_modbus(
                device_id=device_id_motor,
                func=0x05,
                ad=0,
                qty_lo=0,
                qty_hi=0xFF,
                check_inp_out=True,
            )
            if bool_val:
                data = self.read_modbus(device_id=device_id_motor, ad=0x00, qty_lo=0x04)
                if data and data[3] % 10 == 1:
                    flag = True
                    logfo.logs(
                        f"Motor Status. Try {p+1}",
                        f"Successfully Turned On motor: {motorNum + 1} of tank with device_id :{device}",
                    )
                    self.delete_error(id=f"motor-{motorNum + 1}-{device}")
                    break

        if not flag:
            self.generate_log(
                id=f"motor-{motorNum + 1}-{device}",
                title="Motor Error",
                description=f"Turning On motor: {motorNum + 1} of tank with device_id :{device} Failed",
            )
            logfo.loge(
                f"Motor Error.",
                f"Turning Off motor: {motorNum + 1} of tank with device_id :{device} Failed",
            )

        self.schedular_map[ind] = sched_map

    def get_records(self, device, date_start, date_end):
        if isinstance(date_start, int):
            start = date_start
            end = date_end
        else:
            start = time_helper.get_unixtime_from_datetime(date_start)
            end = (
                int(time_helper.get_unixtime_from_datetime(date_end))
                + (24 * 60 * 60)
                - 1
            )
        # List of devices to get record for
        if isinstance(device, int):
            device = [device]
        if not device:
            for d in self.device_table:
                # if d in
                device.append(d["id"])
        # Get records
        results = {}
        for d in device:
            results[d] = []
            name = self.get_device(d)["name"] + "-" + str(d)
            sql = "SELECT * FROM admin_database.`{n}` WHERE unix_time BETWEEN {s} AND {e}".format(
                n=name, s=start, e=end
            )
            r = sql_handler.getResult(sql)
            if r:
                results[d] = r

        return results

    def get_spec_records(self, device, start_unix, end_unix, param):
        # List of devices to get record for
        if isinstance(device, int):
            device = [device]
        results = {}
        if not device:
            for d in self.device_table:
                # if d in
                dev_id = d["id"]
                results[str(dev_id)] = []
                device.append(dev_id)

        for d in device:
            start = start_unix
            end = end_unix
            if not isinstance(start_unix, int):
                start = int(time_helper.get_unixtime_from_datetime(start_unix))

            if not isinstance(end_unix, int):
                end = (
                    int(time_helper.get_unixtime_from_datetime(end_unix))
                    + (24 * 60 * 60)
                    - 1
                )

            name = self.get_device(d)["name"] + "-" + str(d)
            sql = "SELECT `{param}`,unix_time FROM admin_database.`{n}` WHERE unix_time BETWEEN {s} AND {e}".format(
                param=param, n=name, s=start, e=end
            )
            try:
                r = sql_handler.getResult(sql)
                if r:
                    results[str(d)] = r

            except Exception as e:
                results[str(d)] = []

        return results

    def get_report_mix(
        self,
        device,
        date_start,
        date_end,
        interval,
        func,
        parameters=[],
        unix_time=True,
    ):
        result = []
        mix = []
        for d in device:
            report = self.get_report(
                d,
                date_start,
                date_end,
                interval,
                func,
                parameters=parameters,
                unix_time=unix_time,
            )
            result.append(report)
        logfo.logi("Modbus", "Postprocessing Report")
        for i in range(len(result[0])):
            d = {}
            for j in range(len(result)):
                d.update(result[j][i])
            mix.append(d)
        logfo.logs("Modbus", "Postprocessing Report Done")
        return mix

    def get_report(
        self,
        device,
        date_start,
        date_end,
        interval,
        func,
        parameters=None,
        unix_time=False,
    ):
        if parameters:
            params = parameters[:]
        else:
            params = [d["name"] for d in self.get_device(device)["parameters"]]

        if (24 * 60) % interval:
            logfo.loge("Interval not divisible equally, ignoring last interval")
        # Get list of pairs based on intervals, eg(5min) - [(1674239400, 1674239400+5*60)]        
        start = int(time_helper.get_unixtime_from_datetime(date_start))
        end = int(time_helper.get_unixtime_from_datetime(date_end))
        
        if unix_time:
            start = int(time_helper.get_unixtime_from_datetime(date_start))
            end = int(time_helper.get_unixtime_from_datetime(date_end)) + (24 * 60 * 60)

        # logfo.logi("Report", "Start:", start, ' ', time_helper.get_datetime_from_unixtime(start))
        # logfo.logi("Report", "end:", end, ' ',time_helper.get_datetime_from_unixtime(end))
        step = int(interval) * 60
        groups = []
        result = []
        meta_full = self.get_device(device)
        if not meta_full:
            logfo.loge("Get Report", "Non-existent device: ", device)
            return
        meta = {}
        meta["name"] = meta_full["name"]
        meta["id"] = meta_full["id"]
        logfo.logi("Modbus", "Fetching Report, id:", device)
        print(func)
        if func == "ALL":
            columns = ", ".join("`{}`".format(p) for p in params)
            sql = "SELECT {columns},timestamp FROM admin_database.`{name}` WHERE unix_time BETWEEN {start_time} AND {end_time}".format(
                columns=columns,
                name=self.get_device(device)["name"] + "-" + str(device),
                start_time=start,
                end_time=end
            )
            print(sql)
            r = sql_handler.getResult(sql)
            # timestamp = r[0]['timestamp']
            # if r[0]['timestamp'] == None:
            #     timestamp = time_helper.get_datetime_from_unixtime(group[0])
            # else:
            #     timestamp %= (interval*60)
            if r:
                for row in r:
                    result_row = {}  # Single row like V1: 123, V2:123, timespamp:abcd
                    for param in params:
                        result_row[param] = self._get_sql_float([row], param)
                        result_row['timestamp'] = row['timestamp']
                
                    non_device_keys = {"timestamp", "name", "id"}
                    if any(value is not None for key, value in result_row.items() if key not in non_device_keys):
                        result_row.update(meta)
                        result.append(result_row)
        else:
            for sec in range(start, end, step):
                groups.append((sec, sec + step - 1))
            for group in groups:
                result_row = {}  # Single row like V1: 123, V2:123, timespamp:abcd
                for param in params:
                    sql = "SELECT {func}(`{key}`) AS `{key}` FROM admin_database.`{name}` WHERE unix_time BETWEEN {start_time} AND {end_time}".format(
                        name=self.get_device(device)["name"] + "-" + str(device),
                        start_time=group[0],
                        end_time=group[1],
                        key=param,
                        func=func,
                    )
                    r = sql_handler.getResult(sql)
                    timestamp = time_helper.get_datetime_from_unixtime(group[0])
                    # timestamp = r[0]['timestamp']
                    # if r[0]['timestamp'] == None:
                    #     timestamp = time_helper.get_datetime_from_unixtime(group[0])
                    # else:
                    #     timestamp %= (interval*60)
                    if r:
                        result_row[param] = self._get_sql_float(r, param)
                        

                non_device_keys = {"timestamp", "name", "id"}
                if not any(value is not None for key, value in result_row.items() if key not in non_device_keys):
                    continue
                
                result_row["timestamp"] = timestamp
                result_row.update(meta)
                result.append(result_row)
                        
        logfo.logs("Modbus", "Fetching Report Done")
        return result

    def get_report_all(self, date_start, date_end, interval, func):
        # table = []
        for device in self.device_table:
            self.get_report(device["id"], date_start, date_end, interval, func)

    def get_device(self, device_id):
        dev = [device for device in self.device_table if device["id"] == int(device_id)]
        if len(dev):
            return dev[0]
        return None


modbus = Modbus()
