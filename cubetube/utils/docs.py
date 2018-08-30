from bs4 import BeautifulSoup
with open ("docs-raw.html", "r") as rawFile:
    data=rawFile.read()
with open ("docs-header.html", "r") as rawFile:
    header=rawFile.read()
with open ("docs-footer.html", "r") as rawFile:
    footer=rawFile.read()
data=data.replace("<p>","")
data=data.replace("</p>","")
print data
soup = BeautifulSoup(data)

firstHeader=soup.b
print firstHeader
tag=firstHeader.next_sibling
if tag is None:
    print "none"
while tag!=None:
    if tag is None:
        print "none"
    else:
        print tag
    tag=tag.next_sibling
with open("docs-formatted.html", "w") as output:
    output.write('<ul class="docs-nav">\n')
    
    output.write('</ul>')
