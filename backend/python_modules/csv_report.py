from progress.bar import Bar as Bar
import csv
import python_modules.time_helper as time_helper
import python_modules.logfo as logfo

class CsvReport():
    def __init__(self, instance) -> None:
        self.instance = instance
        pass

    def add_data_json(self, data):
        if len(data['parameters']) == 0:
            data['parameters'] = self.instance.get_device(data['id'])[
                'parameters']
            
        return self.add_data(data['id'], data['day_start'], data['day_end'],
                      data['interval'], data['func'], data['parameters'])


    def add_data(self, device_id, day_start, day_end, interval, func, parameters, legend='', xlabel_rotation=90, x_label='Time'):
        time_only = False
        if day_start == day_end:
            time_only = True
            
        data = self.instance.get_report_mix(
            device_id, day_start, day_end, interval, func, parameters,unix_time=time_only)
        logfo.logi("Report CSV","Generating")
        # self.bar = Bar('Generating CSV Report')
        # self.bar.max = len(data) * (len(parameters) + 1) + 3
        # self.bar.next()
        return self._generate_csv(data, parameters)
        # self.bar.next()


    def _generate_csv(self, data, params):
        # Table headers
        self.headers = []
        self.rows = []
        for parameter in params:    
            self.headers.append(parameter)
        self.headers.append('Timestamp')
        for row in data:
            r = []
            for parameter in params:
                r.append(row[parameter])
                # self.bar.next()
            self.rows.append(r+[row['timestamp']])
            # self.bar.next()
        for i in range(len(self.rows)):
            for j in range(len(self.rows[i])):
                self.rows[i][j] = 'null' if not self.rows[i][j] else self.rows[i][j]
        fil = "Report " + time_helper.get_timestamp().replace(':','-') + '.csv'
        self.save(fil)
        return fil
        

    def save(self, filename, q=csv.QUOTE_NONE):
        with open("Reports " + filename, 'w', newline="") as file:
            csvwriter = csv.writer(file, quoting=q) # 2. create a csvwriter object
            csvwriter.writerow(self.headers) # 4. write the header
            csvwriter.writerows(self.rows) # 5. write the rest of the data
        logfo.logs("Report CSV","CSV Created:", filename)
        # self.bar.next()