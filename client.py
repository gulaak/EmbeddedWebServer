import socketio
import threading
import os
import subprocess

sio = socketio.Client()


sio.connect("http://localhost:3000")


def run_program(data,ID):
    #print("I received data", data)
    res = subprocess.run(['python','-c',data],stdout=subprocess.PIPE)
    stdout_resp = res.stdout.decode())
    if "Error" in stdout_resp:
        sio.emit('compile failed',ID)
    else:
        sio.emit('compile success',ID)
    

    


@sio.event
def message(data):
    print("I received data")




@sio.on("send program")
def on_file(data, ID):
    thread = threading.Thread(target=run_program, args=(data,ID,))
    thread.start()











