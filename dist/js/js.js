"use strict";function getHash(){return location.hash?location.hash.substring(1):""}function set(t,o){localStorage["allso_"+t]=o;var e=Object.keys(engines[o])[0],s=engines[o][e];set_url[t]=s[0],set_top[t]=s[2],set_left[t]=s[3],set_foot[t]=s[4],$("a.navbar-brand img").eq(t).attr("src",s[1]),need_respond=!0}function change_state(t){2==localStorage.allso_state?localStorage.allso_state=t?0:1:localStorage.allso_state=2,respond(),2==localStorage.allso_state&&so()}function respond(){var t=$("body").width(),o=$(window).height(),e=$("nav.navbar").height(),s=t/2;2==localStorage.allso_state?(obja.fadeIn("fast").animate({"margin-left":set_left[0],width:s-set_left[0]},"fast"),objb.fadeIn("fast").animate({"margin-left":s+set_left[1],width:s-set_left[1]},"fast"),objProgress[0].style.width="50%",objProgress[1].style.width="50%"):0==localStorage.allso_state?(obja.fadeIn("fast").animate({"margin-left":set_left[0],width:t-set_left[0]},"fast"),objb.fadeOut("fast"),objProgress[0].style.width="75%",objProgress[1].style.width="25%"):(obja.fadeOut("fast"),objb.fadeIn("fast").animate({"margin-left":set_left[1],width:t-set_left[0]},"fast"),objProgress[0].style.width="25%",objProgress[1].style.width="75%"),obja.animate({"margin-top":set_top[0]+e,height:o-set_top[0]-e+set_foot[0]},"fast"),objb.animate({"margin-top":set_top[1]+e,height:o-set_top[1]-e+set_foot[1]},"fast"),need_respond=!1}function so(t){if(""!==$.trim(soinput_obj[0].value)){var o=soinput_obj[0].value,e=encodeURIComponent(o),s=localStorage.allso_state;2!==s&&t!==s&&(localStorage.allso_state=2,respond()),2==s?void 0===t?(obja[0].src=set_url[0]+e,objb[0].src=set_url[1]+e):0===t?obja[0].src=set_url[0]+e:objb[0].src=set_url[1]+e:0==s&&(1!==t?obja[0].src=set_url[0]+e:0!==t&&(objb[0].src=set_url[1]+e)),location.hash=o,window.document.title=o+" - ALLSO"}else location.hash="",window.document.title="ALLSO - 聚合搜索引擎";need_respond&&respond(),objProgress.addClass("progress-bar-striped active"),window.setTimeout(function(){objProgress.removeClass("progress-bar-striped active")},2e3)}if($(window).width()<770){var get_answer=confirm("ALLSO 是一个聚合性搜索引擎，可以同时对 2 个搜索引擎展开搜索，页面一分为二，充分利用屏幕资源。\n\n然而。。。\n\n你的屏幕实在是太小了，请在电脑或平板上使用 ALLSO，相信会带给你一份相当棒的体验！\n\nhttp://yicone.github.io/allso/\n\n----------\n点击[是]，将跳转到必应手机版：");if(get_answer){var hash=getHash();hash?window.location.href="https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q="+hash:window.location.href="https://cn.bing.com/"}}var soinput_obj=$("#soinput"),objProgress=$("div.progress>div"),obja=$("#a"),objb=$("#b"),obj_autoSO=$("#autoSO"),autoSO=!0,engines=[{Google:["https://www.google.com/search?q=","https://www.google.com/images/icons/ui/doodle_plus/logo.png",-76,-120,87]},{"Ask Google":["https://www.search.ask.com/web?q=","https://www.search.ask.com/assets/b/a-logo-small.png",-60,-120,120]},{"搜狗":["https://www.sogou.com/web?query=","https://img01.sogoucdn.com/app/a/100520122/0c6aeb64_jieguo.png",0,0,127]},{"必应":["https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q=","https://cn.bing.com/sa/simg/CN_Logo_Gray.png",-72,-80,60]},{"微博":["http://s.weibo.com/weibo/","http://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo.png?id=1404211047727",-180,0,163]},{"360搜索":["https://www.haosou.com/s?q=","https://p.ssl.qhimg.com/t0184e4ce3cb83220c1.png",0,-10,80]},{"百度":["https://www.baidu.com/s?wd=","https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",-45,-90,70]},{GitHub:["https://github.com/search?q=","http://www.hack.institute/events/connected-car/img/github-logo-white.png",-130,0,200]}],default_engines=[0,1],need_respond=!0,set_url=[],set_top=[0,0],set_left=[0,0],set_foot=[0,0],$engines=$(".engines");respond(),$engines.each(function(t){for(var o in engines){var e=engines[o],s=t,a=o,n=Object.keys(e)[0],i='<li><a onclick="set('+s+","+a+");so("+s+');">'+n+"</a></li>";$(this).append(i)}});for(var i in default_engines){var engine_index;engine_index=void 0==localStorage["allso_"+i]?default_engines[i]:localStorage["allso_"+i],set(i,engine_index)}void 0===localStorage.allso_autoSO?(localStorage.allso_autoSO=!0,obj_autoSO[0].checked=!0,autoSO=!0):(obj_autoSO[0].checked="true"===localStorage.allso_autoSO,autoSO=obj_autoSO[0].checked),obj_autoSO.change(function(){localStorage.allso_autoSO=this.checked,autoSO=this.checked}),function(){if(location.hash){var t=getHash();t=decodeURIComponent(t).replace(/\+/g," "),soinput_obj[0].value=t,so()}}(),void 0==localStorage.allso_state&&(localStorage.allso_state=2),$(window).resize(function(){respond()}),soinput_obj.on("input",function(){autoSO&&so()}),$("div.loading").fadeOut("fast");
//# sourceMappingURL=js.js.map
