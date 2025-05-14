from python_modules.sql_handler import getResult, run_query
from python_modules.modbus_helper import modbus
from python_modules.pdf_report import PdfReport
import python_modules.time_helper as time_helper
from python_modules.filepaths import *
from python_modules.csv_report import CsvReport
from flask import (
    Flask,
    request,
    Response,
    jsonify,
    send_from_directory,
)
import os, sys, time, json, copy
from flask_cors import CORS
from werkzeug.serving import WSGIRequestHandler
from python_modules.logfo import *
import operator
from functools import reduce

COM_PORT = ""
BAUD_RATE = 9600
DEVICE_TABLE_RAW = []


def _reset_database():
    sql = "DROP DATABASE admin_database;"
    try:
        run_query(sql)
        logs("SQL-QUERY", "Successfully Reset the database")
    except Exception as e:
        raise Exception(e)


def _create_database():
    # Create database if it doesn't exist
    sql = "CREATE DATABASE IF NOT EXISTS admin_database"
    getResult(sql)


def _create_new_device_table(config):
    params = config["parameters"]
    params_sql = ""  # list of LIKE `id_db` varchar(45) DEFAULT Null,

    for p in params:
        params_sql += "\t`{name}` REAL DEFAULT Null,\n".format(name=p["name"])

    # Create tables
    sql = """
    CREATE TABLE `admin_database`.`{name}` (
      {params}
      `timestamp` varchar(45) NOT NULL,
      `unix_time` INT NOT NULL,
      PRIMARY KEY(`unix_time`)
    )
    """.format(
        name=config["name"] + "-" + str(config["id"]), params=params_sql
    )
    getResult(sql)


def load_device_config():
    global COM_PORT
    global BAUD_RATE
    global DEVICE_TABLE_RAW
    try:
        f = open(JSON_CONFIG)
        config = json.load(f)
        COM_PORT = config["COM_PORT"]
        BAUD_RATE = config["BAUD_RATE"]
    except Exception as e:
        loge("JSON-LOAD", "Error loading device config: ", e)
        sys.exit("Configurtion file error: " + str(e))
    try:
        f = open(JSON_METER_CONFIG)
        DEVICE_TABLE_RAW = json.load(f)
        logs("JSON-LOAD", "Loaded device config")
    except Exception as e:
        loge("JSON-LOAD", "Error loading device config: ", e)
        sys.exit("Device Configurtion file error: " + str(e))

    _create_database()

    for device in DEVICE_TABLE_RAW:
        _create_new_device_table(device)


# ----------------------------------- FLASK ---------------------------------- #
WSGIRequestHandler.protocol_version = "HTTP/1.1"
app = Flask(__name__, static_url_path="", static_folder="webpage")
# ui = WebUI(app, debug=True)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
CORS(app)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    """Return index.html for all non-api routes"""
    if IS_BUILD:
        direc = ret(f"{app.static_folder}/{path}")
    else:
        direc = f"{app.static_folder}/{path}"
    if path != "" and os.path.exists(direc):
        return send_from_directory(
            ret(app.static_folder) if IS_BUILD else app.static_folder,
            ret(path) if IS_BUILD else path,
        )
    else:
        return send_from_directory(
            ret(app.static_folder) if IS_BUILD else app.static_folder, "index.html"
        )


@app.route("/get_devices", methods=["GET"])
def get_devices():
    f = open(JSON_METER_CONFIG)
    DEVICE_TABLE_RAW = json.load(f)
    return jsonify(DEVICE_TABLE_RAW)


@app.route("/get_device_config", methods=["GET"])
def get_device_config():
    for d in DEVICE_TABLE_RAW:
        if d["id"] == request.json["id"]:
            return jsonify(d)
    return "Not found"


@app.route("/generate_report", methods=["POST"])
def generate_session_report():
    try:
        js = request.json
        _parameters = js["parameters"]
        _day_start = js["day_start"]
        _day_end = js["day_end"]
        _interval = js["interval"]
        _func = js["func"]
        _device_id = js["device_id"]
        report_name = js["report_name"] if len(js["report_name"]) else "System Report"
        pdf = PdfReport(modbus)
        f = pdf.add_data(
            device_id=[_device_id],
            day_start=_day_start,
            day_end=_day_end,
            graph_params=["Temp."],
            interval=_interval,
            func=_func,
            parameters=_parameters,
            report_name=report_name,
        )
        if f:
            return Response(f, status=200, mimetype="text/plain")
        else:
            raise Exception("There was an error generating file.")

    except Exception as e:
        raise Exception(e)


@app.route("/data")
def data():
    def dataStream():
        while True:
            # data = run_and_get_data()
            if modbus.data_ready:
                data = modbus.final_data
                yield "data: " + json.dumps(data) + "\n\n"
                time.sleep(1)

    return Response(dataStream(), mimetype="text/event-stream")


@app.route("/temp_data")
### Temperature Data
def temp_data():
    var = request.args.get(key="var", default="kw", type=str)
    device_ids = request.args.get(
        key="devices", default=[d["id"] for d in DEVICE_TABLE_RAW], type=str
    )
    if isinstance(device_ids, str):
        device_ids = device_ids.strip().split(",")
        if len(device_ids):
            device_ids = [int(dev) for dev in device_ids]
    start = request.args.get(key="start", default=time_helper.get_date(), type=int)
    end = request.args.get(key="end", default=time_helper.get_date(), type=int)

    def dataStream():
        while True:
            data = modbus.get_spec_records(device_ids, start, end, var)
            time.sleep(3)
            if data:
                yield "data: " + json.dumps(data) + "\n\n"

    return Response(dataStream(), mimetype="text/event-stream")


@app.route("/error_data")
def error_data():
    def dataStream():
        while True:
            # data = run_and_get_data()
            data = modbus.errors
            time.sleep(1)
            if data:
                yield "data: " + json.dumps(data) + "\n\n"

    return Response(dataStream(), mimetype="text/event-stream")


@app.route("/update_temp_annos", methods=["POST"])
def update_temp_annos():
    js = request.json
    annos = js["annos"]
    f = open(JSON_METER_CONFIG, "r+")
    temp = json.load(f)
    dev = [x for x in temp if x["id"] == js["devID"]][0]
    ind = temp.index(dev)
    dev["temp_annos"] = annos
    temp[ind] = dev
    x = copy.deepcopy(temp)
    to_write = json.dumps(x, indent=4)
    f.seek(0)
    f.write(to_write)
    f.truncate()
    f.close()
    load_device_config()
    modbus.set_config_device(DEVICE_TABLE_RAW)
    return "done"


@app.route("/get_report", methods=["POST"])
def get_report():
    js = request.json
    start = js["day_start"]
    end = js["day_end"]
    interval = js["interval"]
    func = js["func"]
    params = []
    id_ = []
    for device in js["devices"].items():
        id_.append(device[0])
        params.append(device[1])
    report = modbus.get_report_mix(id_, start, end, interval, func, params)
    return jsonify(report)


@app.route("/get_vars", methods=["GET"])
def get_vars():
    vars_flat = []
    for d in DEVICE_TABLE_RAW:
        vars_calc = [
            {
                **varb,
                "value": f"{d['name']}-{d['id']}_{varb['name']}",
                "text": f"{varb['name']}",
            }
            for varb in d["parameters"]
        ]
        vars_flat = vars_flat + vars_calc

    return jsonify(vars_flat)

@app.route("/csv", methods=["POST"])
def csv():
    try:
        js = request.json
        _parameters = js["parameters"]
        _day_start = js["day_start"]
        _day_end = js["day_end"]
        _interval = js["interval"]
        _func = js["func"]
        _device_id = js["device_id"]
        csv = CsvReport(modbus)
        f = csv.add_data(
            device_id=[_device_id],
            day_start=_day_start,
            day_end=_day_end,
            interval=_interval,
            func=_func,
            parameters=_parameters,
        )
        if f:
            return Response(f, status=200, mimetype="text/plain")
        else:
            raise Exception("There was an error generating file.")

    except Exception as e:
        raise Exception(e)


@app.route("/graph_var_data_stream")
def graph_var_data_stream():
    first_tick_table_name = request.args.get(key="first_tick_table_name", default="", type=str)
    first_tick_var_name = request.args.get(key="first_tick_var_name", default="", type=str)
    second_tick_table_name = request.args.get(key="second_tick_table_name", default="", type=str)
    second_tick_var_name = request.args.get(key="second_tick_var_name", default="", type=str)
    first_tick_device = int(first_tick_table_name.split("-")[1])
    second_tick_device = int(second_tick_table_name.split("-")[1])
    start = time_helper.get_date()
    end =time_helper.get_date()
    
    def dataStream():
        while True:
            first_data = modbus.get_spec_records(first_tick_device, start, end, first_tick_var_name)
            second_data = modbus.get_spec_records(second_tick_device, start, end, second_tick_var_name)
            first_final_data = [d[first_tick_var_name] for d in first_data[str(first_tick_device)]]
            second_final_data = [d[second_tick_var_name] for d in second_data[str(second_tick_device)]]
            if first_final_data.count(None) == len(first_final_data) or second_final_data.count(None) == len(second_final_data):
                raise Exception("No data found")
            final_data =  reduce(operator.add, zip(first_final_data, second_final_data))
            final = [final_data[i:i + 2] for i in range(0, len(final_data), 2)] 
            time.sleep(3)
            if final:
                yield "data: " + json.dumps(final) + "\n\n"

    return Response(dataStream(), mimetype="text/event-stream")



@app.route("/get_records", methods=["POST"])
def get_records():
    js = request.json
    devices = js["id"] if "id" in js else []
    start = js["date_start"]
    end = js["date_end"] if "start_end" in js else start
    r = modbus.get_records(devices, start, end)
    return jsonify(r)


@app.route("/start_motors", methods=["POST"])
def start_motors():
    js = request.json
    run_type = js["type"]
    dev_id = js["devID"]
    # sched_map = [d for d in modbus.schedular_map if d["id"] == dev_id][0]
    # ind = modbus.schedular_map.index(sched_map)

    if run_type == 1:
        modbus.data_buffer = {}
        # sched_map["running_status"] = True
        for d in modbus.schedular_map:
            d['running_status'] = True
        modbus.bool_process(True)
    else:
        # sched_map["running_status"] = False
        # modbus.final_data[str(dev_id)]["running_status"] = sched_map["running_status"]
        for d in modbus.schedular_map:
            d['running_status'] = False

    # modbus.schedular_map[ind] = sched_map

    no_running_statuses = not any(d["running_status"] for d in modbus.schedular_map)
    if no_running_statuses:
        ### checks if no prcoesses are running
        modbus.bool_process(False)  ## shutdown the data retrieval

    stat = str(int(modbus.running == True))
    return Response(stat, status=200, mimetype="text/plain")


if __name__ == "__main__":

    if "reset" in sys.argv:
        _reset_database()
        sys.exit(0)

    load_device_config()

    modbus.set_config_device(DEVICE_TABLE_RAW)
    modbus.set_config(COM_PORT, BAUD_RATE)
    modbus.schedular_map = [
        {
            "id": d["id"],
            "name": d["name"],
            "running_status": False,
            "polling_status": True,
        }
        for d in DEVICE_TABLE_RAW
    ]
    app.run()
    exit()
