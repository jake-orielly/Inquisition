readFile = open("/users/jake/Desktop/inquisition/testMap.html","r").read()
writeFile = open("/users/jake/Desktop/inquisition/testMap.js","w")
result = []
curr = -1
finalResult = "var mapTable = \n["

for i in range(len(readFile)):
    if readFile[i] == "#":
        if (readFile[i:i+7] == "#98ca68"):
            result[curr].append("\"grass\"")
        elif (readFile[i:i+7] == "#408000"):
            result[curr].append("\"oak\"")
        elif (readFile[i:i+7] == "#804000"):
            result[curr].append("\"village\"")
        elif (readFile[i:i+7] == "#14470e"):
            result[curr].append("\"evergreen\"")
        elif (readFile[i:i+7] == "#666666"):
            result[curr].append("\"mountain\"")
        elif (readFile[i:i+7] == "#ffcc66"):
            result[curr].append("\"beach\"")
        elif (readFile[i:i+7] == "#0080ff"):
            result[curr].append("\"ocean\"") #will be ocean

    elif readFile[i:i+4] == "<TR>":
        result.append([])
        curr += 1

for item in result:
    finalResult += "["
    finalResult += (",".join(item))
    finalResult += ","
    finalResult = finalResult[0:-1]
    finalResult += "],\n"
finalResult = finalResult[0:-2]
finalResult += "]"
writeFile.write(finalResult)
writeFile.close()