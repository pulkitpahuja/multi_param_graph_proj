import python_modules.time_helper as time_helper
import python_modules.logfo as logfo
from python_modules.filepaths import *
import io,json,matplotlib
from matplotlib import pyplot as plt
from fpdf import FPDF
matplotlib.use('Agg')
from datetime import datetime


class PdfReport():
    def __init__(self, instance) -> None:
        self.pdf = FPDF('P', 'mm', 'A4')
        self.pdf.add_page()
        self.date_range = ''
        self.interval = ''
        self.meter_name = ''
        self.instance = instance
        self.image_buffer = []
        self.table_buffer = []
        # Load config
        f = open(JSON_REPORT_CONF)
        self.data_added = False
        self.config = json.load(f)
        pass

    def _add_header(self,header="System Report"):
        self.pdf.set_font(self.config['font family'],
                          "B", self.config['title font size'])
        self.pdf.cell(0, 30, header,
                      border=0, align="C", ln=True)

    def add_data_json(self, data):
        if len(data['parameters']) == 0:
            logfo.logw("PDF-Report", 'No params given, using all')
            data['parameters'] = self.instance.get_device(data['id'])[
                'parameters'].keys()
            data['parameters'] = list(data['parameters'])
        return self.add_data(data['id'], data['day_start'], data['day_end'],
                             data['interval'], data['func'], data['parameters'])

    def add_data(self, device_id, day_start, day_end, interval, func, parameters,graph_params, legend='', xlabel_rotation=90, x_label='Time',session_name="",report_name="System Report"):
        time_only = False
        if day_start == day_end:
            time_only = True
        
        data = self.instance.get_report_mix(
            device_id, day_start, day_end, interval, func, parameters,unix_time=time_only)
        if not len(data):
            return False
        
        name = ''
        for n in device_id:
            conf = self.instance.get_device(n)
            name += conf['name'] + '-' + str(n) + ', '
        name = name[:-2]
        self._add_header(header=report_name)
        self._add_meter_header(day_start, day_end, name, interval,session_name)
    
        self._add_meter_table(data, parameters,False)
        self.data_added = True
        fil = "Report " + time_helper.get_timestamp().replace(':','-')
        self.save(fil)
        return fil
     
    def _add_meter_header(self, start, end, name, interval,session_name):
        # Add Headers
        interval_str = ''
        if interval//60:
            interval_str += str(interval//60) + " Hrs "
        interval_str += str(interval % 60) + " Mins"
        self.pdf.set_font(self.config['font family'],
                          "", self.config['font size'])
        self.pdf.cell(0, 6, "Device Name: " + name,
                      border=0, align="L", ln=True)
        self.pdf.cell(0, 6, "Date-Range: " + start + ' To ' +
                      end, border=0, align="L", ln=True)
        self.pdf.cell(0, 6, "Interval: " + interval_str,
                      border=0, align="L", ln=True)
        self.pdf.cell(0, 8, ln=True)

    def _add_meter_graph(self, data, params, legend, xlabel_rotation, x_label, time_only,annos,day_start,day_end):
        plt.subplots_adjust(bottom=0.35)
        plt.rcParams["font.size"] = 8
        plot_x = []
        plot_y = []
        for parameter in params:
            for x in data:
                if not x['timestamp']:
                    x['timestamp'] = ""
                else:
                    plot_x.append(x[parameter])
                    plot_y.append(datetime.strptime(x['timestamp'],'%Y-%m-%d %H:%M:%S'))
            plt.plot(plot_y, plot_x, label=parameter)

        plt.xlabel(x_label)
        plt.ylabel(legend)
        plt.xticks(plot_y,rotation=60, ha='right')
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M:%S'))
        plt.locator_params(axis='x', nbins=10)
        # plt.show()
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=300)
        buf.seek(0)
        self.pdf.image(buf, w=self.pdf.epw)
        buf.close()
        plt.close()
        plt.cla()
        plt.clf()

    def _add_meter_table(self, data, params,unix_timestamp=False):
        self.pdf.set_font(self.config['font family'],
                          "", self.config['font size'])
        parameters = params
        # Find max row width
        logfo.logi("Report PDF", "Generating Data table")
        # print("Params:", parameters)
        temp = []
        for row in data:
            for parameter in parameters:
                val = row[parameter]
                val = 0 if val == None else val
                temp.append(val)
        # print("Temp:", temp)
        max_val = len(str(max(temp)))
        width = self.pdf.font_size * max_val
        width_ts = self.pdf.font_size * 12
        width_total = width * len(parameters) + width_ts
        height = self.pdf.font_size * 2
        start_pos = (self.pdf.epw - width_total)//2
        width *= self.pdf.epw/width_total
        width_ts *= self.pdf.epw/width_total
        self.pdf.cell(start_pos, height)
        self.pdf.ln()

        # Table headers
        self.pdf.set_font(style="B")
        for parameter in parameters:
            self.pdf.cell(width, height, parameter, border=True, align='C')
        self.pdf.cell(width_ts, height, "Timestamp", border=True, align='C')
        self.pdf.set_font(style="")
        self.pdf.ln()
        for row in data:
            for parameter in parameters:
                if row[parameter]:
                    self.pdf.cell(width, height, str(
                        row[parameter]), border=True, align='C')
                else:
                    self.pdf.cell(width, height, '-', border=True, align='C')

            ts = row['timestamp'][:10] + ' - ' + row['timestamp'][10:]
            self.pdf.cell(width_ts, height, ts,
                          border=True, ln=True, align='C')

    def save(self, filename):
        self.filename = filename
        self.save_daemon()
        logfo.logs("PDF-Report", "PDF Created, ", self.filename)

    def save_daemon(self):
        if not self.data_added:
            return logfo.loge("PDF-Report", "No data added")
        self.pdf.output("" + self.filename + '.pdf')

    def footer(self):
        # Position cursor at 1.5 cm from bottom:
        self.set_y(-15)
        # Setting font: helvetica italic 8
        self.set_font("helvetica", "I", 8)
        # Printing page number:
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")
