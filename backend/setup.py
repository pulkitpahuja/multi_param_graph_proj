import cx_Freeze
import sys
import matplotlib

base = None

if sys.platform == 'Win32':
    base = "Win32GUI"

executables = [cx_Freeze.Executable("app.py", base=base)]

cx_Freeze.setup(
    name = "Data monitoring App",
    options = {"build_exe": {"packages":["flask","flask_cors","serial","time","sys","json","os","random","csv","threading",
    "struct","datetime","fpdf","signal","mysql","apscheduler"]}}, 
    version = "0.01",
    description = "Meter data Monitoring App",
    executables = executables
    )
