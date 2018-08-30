import subprocess
import time

current_milli_time = lambda: int(round(time.time() * 1000))
accessToken="12ce538ae21ffabb1708f0393cf3c2a5af0cdfa4"
coreID="53ff6e066667574838440967"
pathToFile="demo.bin"
print("running program")
startTime= current_milli_time()
print startTime
p = subprocess.Popen(['node', './flash.js',accessToken, coreID, pathToFile], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
for line in p.stdout.readlines():
    print line,
retval = p.wait()

endTime=current_milli_time()
print endTime-startTime
