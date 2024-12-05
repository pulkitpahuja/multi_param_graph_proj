from datetime import date, timedelta, datetime, timezone as tzz
import dateutil,time

from pytz import timezone
curr_tz = datetime.now().astimezone().tzinfo.tzname(datetime.now())
tz_inf = "Canada/Eastern" if curr_tz == "EST" or curr_tz == "EDT"  else "Asia/Calcutta"
curr_tz = timezone(tz_inf)

def get_dates(start_date, end_date):
    sdate = datetime.strptime(start_date, "%Y-%m-%d")  # start date
    edate = datetime.strptime(end_date, "%Y-%m-%d")  # end date
    delta = edate - sdate  # as timedelta
    lst = []
    for i in range(delta.days + 1):
        day = sdate + timedelta(days=i)
        lst.append(day.strftime("%Y-%m-%d"))
    return lst

def get_time():
    now = datetime.now(tz=curr_tz)
    time_string = now.strftime("%H:%M:%S")
    return time_string

def get_date():
    now = datetime.now(tz=curr_tz)
    date_string = now.strftime("%Y-%m-%d")
    return date_string

 
def get_timestamp() -> str:
    return get_date() + ' ' + get_time() 

def get_unix_time():
    return str(int(time.time()))

def get_unixtime_from_datetime(date):
    d = datetime.strptime(date, '%Y-%m-%d')
    news_date = d.replace(tzinfo=dateutil.tz.gettz(tz_inf))
    unix_time = int(news_date.timestamp())
    return str(unix_time)

def get_datetime_from_unixtime(unix):
    return datetime.fromtimestamp(unix,tz=curr_tz).strftime('%Y-%m-%d %H:%M:%S')
