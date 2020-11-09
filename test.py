import subprocess
program = """
x = [1,2,3,4]
for elem in x:
    print(elem) 
"""


res = subprocess.run(['python','-c',program],stdout=subprocess.PIPE)
print(res.stdout.decode())