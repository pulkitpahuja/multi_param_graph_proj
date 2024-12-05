import os, sys

IS_BUILD = 0

def ret(filename):
    return os.path.join(os.path.dirname(sys.executable), filename)

if IS_BUILD:
    JSON_METER_CONFIG = ret("configs/meter_config.json") 
    JSON_CONFIG = ret("configs/config.json")
    JSON_IPCONF = ret("configs/ipconfig.json")
    JSON_REPORT_CONF = ret("configs/report_config.json")

else:
    JSON_METER_CONFIG = "configs/meter_config.json"
    JSON_CONFIG = "configs/config.json"
    JSON_IPCONF = "configs/ipconfig.json"
    JSON_REPORT_CONF = "configs/report_config.json"