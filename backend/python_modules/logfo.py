def logi(*argv, end="\n", send_log=False):
    arg_list = list(argv)
    arg_list[0] = "[" + arg_list[0] + "] "
    s = ""
    for arg in arg_list:
        s += str(arg) + " "
    if send_log:
        from python_modules.modbus_helper import modbus

        modbus.generate_log(
            id=s,
            title=arg_list[0],
            description=" ".join(arg_list[1:]),
            error_type="info",
        )
    print(s, end=end)


def logw(*argv, end="\n", send_log=False):
    arg_list = list(argv)
    arg_list[0] = "[" + arg_list[0] + "] "
    s = ""
    for arg in arg_list:
        s += str(arg) + " "
    if send_log:
        from python_modules.modbus_helper import modbus

        modbus.generate_log(
            id=s,
            title=arg_list[0],
            description=" ".join(arg_list[1:]),
            error_type="warning",
        )
    print(s, end=end)


def loge(*argv, end="\n", send_log=False):
    arg_list = list(argv)
    arg_list[0] = "[" + arg_list[0] + "] "
    s = ""
    for arg in arg_list:
        s += str(arg) + " "
    if send_log:
        from python_modules.modbus_helper import modbus

        modbus.generate_log(
            id=s,
            title=arg_list[0],
            description=" ".join(arg_list[1:]),
            error_type="danger",
        )
    print(s, end=end)


def logs(*argv, end="\n", send_log=False):
    arg_list = list(argv)
    arg_list[0] = "[" + arg_list[0] + "] "
    s = ""
    for arg in arg_list:
        s += str(arg) + " "
    if send_log:
        from python_modules.modbus_helper import modbus

        modbus.generate_log(
            id=s,
            title=arg_list[0],
            description=" ".join(arg_list[1:]),
            error_type="success",
        )
    print(s, end=end)
