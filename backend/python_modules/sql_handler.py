import python_modules.logfo as logfo
from python_modules.filepaths import *
import pymysql, json


def get_col_header(desc):
    if not desc:
        return None
    d = []
    for x in desc:
        d.append(x[0])
    return d


f = open(JSON_IPCONF)
try:
    ipconfig = json.load(f)
except Exception as e:
    logfo.loge("JSON-LOAD", "Error Loading Server Config: ", e)
    exit()
logfo.logs("JSON-LOAD", "Server Config loaded")
f.close()


def run_query(sql):
    if sql is None:
        return Exception("sql query is needed")
    try:
        con = pymysql.connect(
            host=ipconfig["db_host"],
            port=int(ipconfig["db_port"]),
            user=ipconfig["db_user"],
            password=ipconfig["db_password"],
        )
        cursor = con.cursor()
        cursor.execute(sql)
        con.commit()

    except Exception as e:
        con.close()
        raise Exception(e)


def getResult(sql, vars=[]):
    for var in vars:
        if type(var) == str:
            if not var.isnumeric():
                sql = sql.replace("%s", '"' + str(var) + '"', 1)
            else:
                sql = sql.replace("%s", str(var), 1)
        else:
            sql = sql.replace("%s", str(var), 1)

    try:
        list_dict = []
        con = pymysql.connect(
            host=ipconfig["db_host"],
            port=int(ipconfig["db_port"]),
            user=ipconfig["db_user"],
            password=ipconfig["db_password"],
        )
        cursor = con.cursor()
        result = None
        cursor.execute(sql)
        con.commit()
        result = cursor.fetchall()
        try:
            col_header = get_col_header(cursor.description)
            # print("Headers: " + str(col_header))
            if col_header:
                if not result:
                    result = []
                    r = []
                    for i in range(len(col_header)):
                        r.append(None)
                    result.append(tuple(r))
                # print("Result: " + str(result))
                for i in range(len(result)):
                    list_dict.append({})
                    for j in range(len(col_header)):
                        list_dict[i][col_header[j]] = result[i][j]
                # print_log("Merged: " + str(list_dict))
                result = list_dict

        except Exception as e:
            con.close()
            logfo.logw("SQL", "Error processing data from query: ", e)

        return result

    except Exception as e:
        con.close()
        logfo.loge("SQL", "Error executing query: ", e)
        return None
