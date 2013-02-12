var transition = require('./transition.js');


(function(){var a,b,c,d,e,f,g;a="@{arguments}".split(","),c=["background-size","border-","box-shadow","column","transform"],d=c.length,e=a,f=!1,b=a.length;for(var h=0;h<d;h++)for(var i=0;i<b;i++){g=new RegExp(c[h],"g");try{"".trim(),f=!0}catch(j){f=!1}a[i]=f?a[i].trim():a[i],g.test(a[i])&&(e[i]=a[i].replace(g,"-moz-"+c[h]))}return e.join(",")}())
