function getHash() {
    if (location.hash)
        return location.hash.substring(1);
    return '';
}


if ($(window).width() < 770) {
    var get_answer = confirm("ALLSO 是一个聚合性搜索引擎，可以同时对 2 个搜索引擎展开搜索，页面一分为二，充分利用屏幕资源。\n\n然而。。。\n\n你的屏幕实在是太小了，请在电脑或平板上使用 ALLSO，相信会带给你一份相当棒的体验！\n\nhttp://yicone.github.io/allso/\n\n----------\n点击[是]，将跳转到必应手机版：");
    if (get_answer) {
        var hash = getHash();
        if (hash)
            window.location.href = "https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q=" + hash;
        else
            window.location.href = "https://cn.bing.com/";
    }
}


//常用变量
var soinput_obj = $('#soinput'),
    objProgress = $('div.progress>div'),
    obja = $('#a'),
    objb = $('#b'),
    obj_autoSO = $('#autoSO'),
    autoSO = true,
    // { name: [search_url, logo, top, left, foot]}
    engines = [
        { "Google": ["https://www.google.com/search?q=", "https://www.google.com/images/icons/ui/doodle_plus/logo.png", -76, -120, 87] },
        { "Ask Google": ["https://www.search.ask.com/web?q=", "https://www.search.ask.com/assets/b/a-logo-small.png", -60, -120, 120] },
        { "搜狗": ["https://www.sogou.com/web?query=", "https://img01.sogoucdn.com/app/a/100520122/0c6aeb64_jieguo.png", 0, 0, 127] },
        { "必应": ["https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q=", "https://cn.bing.com/sa/simg/CN_Logo_Gray.png", -72, -80, 60] },
        {"微博": ["http://s.weibo.com/weibo/", "http://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo.png?id=1404211047727", -180, 0, 163]},
        { "360搜索": ["https://www.haosou.com/s?q=", "https://p.ssl.qhimg.com/t0184e4ce3cb83220c1.png", 0, -10, 80] },
        { "百度": ["https://www.baidu.com/s?wd=", "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png", -45, -90, 70] },
        {"GitHub": ["https://github.com/search?q=", "http://www.hack.institute/events/connected-car/img/github-logo-white.png", -130, 0, 200]}
    ],
    // btn_styles = ["btn-info", "btn-warning", "btn-danger", "btn-success"],
    default_engines = [0, 1];
var need_respond = true;
var set_url = [], set_top = [0, 0], set_left = [0, 0], set_foot = [0, 0];
var $engines = $('.engines');

respond(); //启动后的第一次响应式

$engines.each(function (i) {
    for (var j in engines) {
        var engine = engines[j];
        var side = i;
        // var btn_style = btn_styles[side];
        var engine_index = j;
        var engine_name = Object.keys(engine)[0];
        // var btn = `<button type="button" class="btn ${btn_style}" onclick="set(${side},${engine_index})">${engine_name}</button>&nbsp;`;
        var li = `<li><a onclick="set(${side},${engine_index});so(${side});">${engine_name}</a></li>`;
        $(this).append(li);
    }
});

/* 设置默认搜索引擎 */
for (var i in default_engines) {
    // var unselected = btn_styles[i];
    // var selected = btn_styles[parseInt(i) + 2];
    // var $buttons = $($engines[i]).find('button');

    var engine_index;
    if (localStorage["allso_" + i] == undefined) {
        engine_index = default_engines[i];
    } else {
        engine_index = localStorage["allso_" + i];
    }

    set(i, engine_index);
    // var $button = $buttons.eq(engine_index);
    // $button.removeClass(unselected).addClass(selected);
    // // 阻止闭包
    // (function ($btns, unselected, selected) {
    //     //设置按钮点击后颜色变化
    //     $buttons.click(function () {
    //         $btns.removeClass(selected).addClass(unselected);
    //         $(this).removeClass(unselected).addClass(selected);
    //     });
    // })($buttons, unselected, selected);
}


if (localStorage["allso_autoSO"] === undefined) {
    localStorage["allso_autoSO"] = true;
    obj_autoSO[0].checked = true;
    autoSO = true;
}
else {
    obj_autoSO[0].checked = localStorage["allso_autoSO"] === 'true';
    autoSO = obj_autoSO[0].checked;
}

function set(side, engine_index) {
    localStorage["allso_" + side] = engine_index;
    var key = Object.keys(engines[engine_index])[0];
    var engine_config = engines[engine_index][key];
    set_url[side] = engine_config[0];
    set_top[side] = engine_config[2];
    set_left[side] = engine_config[3];
    set_foot[side] = engine_config[4];

    $('a.navbar-brand img').eq(side).attr('src', engine_config[1]);

    need_respond = true;
}


// 实时搜索开关
obj_autoSO.change(function () {
    localStorage['allso_autoSO'] = this.checked;
    autoSO = this.checked;
});


/* 响应 Hash */
(function () {
    if (location.hash) {
        var hash = getHash();
        hash = decodeURIComponent(hash).replace(/\+/g, ' ');
        soinput_obj[0].value = hash;
        so();
    }
})();


/* 窗口状态加载 0:左边 1:右边 2:中间 */
if (localStorage["allso_state"] == undefined)
    localStorage["allso_state"] = 2;
/*状态点击改变*/
function change_state(is_zuo) {
    if (localStorage["allso_state"] == 2)
        localStorage["allso_state"] = is_zuo ? 0 : 1;
    else
        localStorage["allso_state"] = 2;
    respond();

    if (localStorage["allso_state"] == 2)
        so();
}


/* 响应式 */
$(window).resize(function () { respond(); });

function respond() {
    var winw = $('body').width(),
        winh = $(window).height(),
        navh = $("nav.navbar").height(),
        abx = winw / 2;

    if (localStorage["allso_state"] == 2) {
        obja.fadeIn('fast').animate({ "margin-left": set_left[0], "width": abx - set_left[0] }, 'fast');
        objb.fadeIn('fast').animate({ "margin-left": abx + set_left[1], "width": abx - set_left[1] }, 'fast');
        objProgress[0].style.width = '50%';
        objProgress[1].style.width = '50%';
    }
    else if (localStorage["allso_state"] == 0) {
        obja.fadeIn('fast').animate({ "margin-left": set_left[0], "width": winw - set_left[0] }, 'fast');
        objb.fadeOut('fast');
        objProgress[0].style.width = '75%';
        objProgress[1].style.width = '25%';
    }
    else {
        obja.fadeOut('fast');
        objb.fadeIn('fast').animate({ "margin-left": set_left[1], "width": winw - set_left[0] }, 'fast');
        objProgress[0].style.width = '25%';
        objProgress[1].style.width = '75%';
    }

    obja.animate({ "margin-top": set_top[0] + navh, "height": winh - set_top[0] - navh + set_foot[0] }, 'fast');
    objb.animate({ "margin-top": set_top[1] + navh, "height": winh - set_top[1] - navh + set_foot[1] }, 'fast');

    need_respond = false;
}


/* 搜索按钮事件 */
soinput_obj.on('input', function () {
    if (autoSO) so();
});
function so(side) {
    if ($.trim(soinput_obj[0].value) !== '') {
        // obja[0].src = ''; objb[0].src = '';
        var sowhat_str = soinput_obj[0].value,
            sowhat = encodeURIComponent(sowhat_str);

        var allso_state = localStorage["allso_state"];

        if(allso_state !== 2 && side !== allso_state){
            localStorage["allso_state"] = 2;
            respond();
        }

        if (allso_state == 2) {
            if (side === undefined) {
                obja[0].src = set_url[0] + sowhat;
                objb[0].src = set_url[1] + sowhat;
            } else if (side === 0) {
                obja[0].src = set_url[0] + sowhat;
            } else {
                objb[0].src = set_url[1] + sowhat;
            }
        }
        else if (allso_state == 0)
            if(side !== 1)
                obja[0].src = set_url[0] + sowhat;
        else
            if(side !== 0)
                objb[0].src = set_url[1] + sowhat;

        location.hash = sowhat_str;
        window.document.title = sowhat_str + ' - ALLSO';
    }
    else {
        location.hash = '';
        window.document.title = 'ALLSO - 聚合搜索引擎';
    }

    if (need_respond)
        respond();

    objProgress.addClass('progress-bar-striped active');
    window.setTimeout(function () {
        objProgress.removeClass('progress-bar-striped active');
    }, 2000);
}


$('div.loading').fadeOut('fast');
