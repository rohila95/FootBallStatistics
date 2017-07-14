import json
from pprint import pprint


final={}
final["rows"]=[]
with open('temp.json') as data_file:    
    data = json.load(data_file)
    for match in data["rows"]:
    	print int(str(match["Year"]))
    	if int(str(match["Year"])) >= 2006:
    		final["rows"].append(match)



with open('totalData.json', 'w') as outfile:  
    json.dump(final, outfile)

