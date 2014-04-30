g.log('start execute $pathname');
var start = +(new Date()), now;

while (1) {
    now = +(new Date());
    console.log(now -start);
    if (now - start > $busy) {
    	g.log('end execute $pathname');
        break;
    }
}
