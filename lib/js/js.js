function getHash() {
    if (location.hash)
        return location.hash.substring(1);
    return '';
}


// if ($(window).width() < 770) {
//     var get_answer = confirm("ALLSO 是一个聚合性搜索引擎，可以同时对 2 个搜索引擎展开搜索，页面一分为二，充分利用屏幕资源。\n\n然而。。。\n\n你的屏幕实在是太小了，请在电脑或平板上使用 ALLSO，相信会带给你一份相当棒的体验！\n\nhttp://yicone.github.io/allso/\n\n----------\n点击[是]，将跳转到必应手机版：");
//     if (get_answer) {
//         var hash = getHash();
//         if (hash)
//             window.location.href = "https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q=" + hash;
//         else
//             window.location.href = "https://cn.bing.com/";
//     }
// }


//常用变量
var $soinput = $('.soinput'),
    $progress = $('div.progress>div'),
    $a = $('#a'),
    $b = $('#b'),
    $autoSO = $('#autoSO'),

    // { name: [search_url, logo, top, left, foot]}
    engines = [
        { "Google": ["https://www.google.com/search?q=", "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png", -76, -120, 87] },
        { "Ask Google": ["https://www.search.ask.com/web?q=", "https://www.search.ask.com/assets/b/a-logo-small.png", -60, -120, 120] },
        { "搜狗": ["https://www.sogou.com/web?query=", "https://img01.sogoucdn.com/app/a/100520122/0c6aeb64_jieguo.png", 0, 0, 127] },
        { "必应": ["https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q=", "https://cn.bing.com/sa/simg/CN_Logo_Gray.png", -72, -80, 60] },
        { "微博": ["http://s.weibo.com/weibo/", "http://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo.png?id=1404211047727", -180, 0, 163] },
        { "360搜索": ["https://www.haosou.com/s?q=", "https://p.ssl.qhimg.com/t0184e4ce3cb83220c1.png", 0, -10, 80] },
        { "百度": ["https://www.baidu.com/s?wd=", "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png", -45, -90, 70] },
        { "GitHub": ["https://github.com/search?q=", "http://www.hack.institute/events/connected-car/img/github-logo-white.png", -130, 0, 200] },
        { "Instapaper": ["https://www.instapaper.com/search?q=", "https://qph.ec.quoracdn.net/main-qimg-81323e136c3a148d9d74ac3ed060b4c2", 0, 0, 0] },
        // {"Evernote": ["https://www.evernote.com/Home.action#n=02864b13-e31b-4215-92c7-cbf7f62a2cf7&ses=1&sh=5&sds=5&x=", "https://evernote.com/media/img/brand-guide/evernote-logos/Evernote_H.png", 0, 0, 0]}
    ],
    translate_api = "http://translate.google.cn/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=";
var need_respond = true;
var set_url = [], set_top = [0, 0], set_left = [0, 0], set_foot = [0, 0];
var $engines = $('.engines');

var state = {
    engines: [1, 2],
    autoSO: true,
    sync_mode: 0
}

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
        // todo: 消除该硬编码
        if (engine_name == "百度" || engine_name == "GitHub") {
            $(this).append(`<li role="separator" class="divider"></li>`);
        }
    }
});

/* 设置默认搜索引擎 */
for (var i in state.engines) {
    // var unselected = btn_styles[i];
    // var selected = btn_styles[parseInt(i) + 2];
    // var $buttons = $($engines[i]).find('button');

    var engine_index;
    if (localStorage["allso_" + i] == undefined) {
        engine_index = state.engines[i];
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
    $autoSO[0].checked = true;
    state.autoSO = true;
}
else {
    $autoSO[0].checked = localStorage["allso_autoSO"] === 'true';
    state.autoSO = $autoSO[0].checked;
}

function set(side, engine_index) {
    localStorage["allso_" + side] = engine_index;
    var key = Object.keys(engines[engine_index])[0];
    var engine_config = engines[engine_index][key];
    set_url[side] = engine_config[0];
    set_top[side] = engine_config[2];
    set_left[side] = engine_config[3];
    set_foot[side] = engine_config[4];

    $('.engine-brand img').eq(side).attr('src', engine_config[1]);

    need_respond = true;
}


// 实时搜索开关
$autoSO.change(function () {
    localStorage['allso_autoSO'] = this.checked;
    state.autoSO = this.checked;
});


/* 响应 Hash */
(function () {
    if (location.hash) {
        var hash = getHash();
        hash = decodeURIComponent(hash).replace(/\+/g, ' ');
        $soinput.val(hash);
        so();
    }
})();


/* 窗口状态加载 0:左边 1:右边 2:中间 */
if (localStorage["allso_state"] == undefined)
    localStorage["allso_state"] = 2;
/*状态点击改变*/
function change_state(is_zuo) {
    var side = is_zuo ? 0 : 1;
    if (localStorage["allso_state"] == 2) {
        localStorage["allso_state"] = side;
        // 单边显示时，取消左偏移
        set_left[side] = 0;
    }
    else {
        localStorage["allso_state"] = 2;
        // todo: 恢复左偏移
    }

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
        $a.fadeIn('fast').animate({ "margin-left": set_left[0], "width": abx - set_left[0] }, 'fast');
        $b.fadeIn('fast').animate({ "margin-left": abx + set_left[1], "width": abx - set_left[1] }, 'fast');
        $progress[0].style.width = '50%';
        $progress[1].style.width = '50%';
    }
    else if (localStorage["allso_state"] == 0) {
        $a.fadeIn('fast').animate({ "margin-left": set_left[0], "width": winw - set_left[0] }, 'fast');
        $b.fadeOut('fast');
        $progress[0].style.width = '75%';
        $progress[1].style.width = '25%';
    }
    else {
        $a.fadeOut('fast');
        $b.fadeIn('fast').animate({ "margin-left": set_left[1], "width": winw - set_left[0] }, 'fast');
        $progress[0].style.width = '25%';
        $progress[1].style.width = '75%';
    }

    $a.animate({ "margin-top": set_top[0] + navh, "height": winh - set_top[0] - navh + set_foot[0] }, 'fast');
    $b.animate({ "margin-top": set_top[1] + navh, "height": winh - set_top[1] - navh + set_foot[1] }, 'fast');

    need_respond = false;
}


/* 搜索按钮事件 */
$($soinput[0]).on('input', function () {
    var keywords = $(this).val();
    $($soinput[1]).val(keywords);
});

$soinput.each(function (i) {
    $(this).on('input', function () {
        if (state.autoSO) {
            console.log('input event', i);
            (i == 0) ? so() : so(i);
        }
    });

    $(this).bind("enterKey", function (e) {
        var sowhat_str = $(this).val();
        location.hash = sowhat_str;
        if (i == 0) {
            sync();
        }
    });

    $(this).keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
        }
    });
});

$('.sync-mode>a').each(function (i) {
    $(this).click({ index: i }, function (e) {
        $('.sync-mode>a').removeClass('btn-danger');
        $(this).addClass('btn-danger');

        state.sync_mode = i;

        sync();
    });
})

function sync() {
    var keywords = $($soinput[0]).val();
    if (!keywords) return;

    var sl, tl;
    if (state.sync_mode == 1) {
        sl = 'en', tl = 'zh-CN';
    } else if (state.sync_mode == 2) {
        sl = 'zh-CN', tl = 'en';
    } else {
        $($soinput[1]).val(keywords);
        so(1);
        return;
    }

    var translate_url = `http://translate.google.cn/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${keywords}`;
    $.ajax({
        url: translate_url,
        dataType: "text",
        success: function (data) {
            var obj = eval(data);
            console.log(obj);
            var r = obj[0][0][0];
            console.log(r);
            $($soinput[1]).val(r);
            so(1);
        },
        error: function (a, b, c) {
            console.error(a, b, c);
        }
    });
}

function so(side) {
    console.log('so', side);
    
    if ($.trim($soinput[0].value) !== '') {
        // obja[0].src = ''; objb[0].src = '';
        var sowhat_stra = $soinput[0].value,
            sowhata = encodeURIComponent(sowhat_stra);
        var sowhat_strb = $soinput[1].value,
            sowhatb = encodeURIComponent(sowhat_strb);

        var allso_state = localStorage["allso_state"];

        if (allso_state !== 2 && side !== allso_state) {
            localStorage["allso_state"] = 2;
            respond();
        }

        if (allso_state == 2) {
            if (side === undefined) {
                $a[0].src = set_url[0] + sowhata;
                $b[0].src = set_url[1] + sowhatb;
            } else if (side === 0) {
                $a[0].src = set_url[0] + sowhata;
            } else {
                $b[0].src = set_url[1] + sowhatb;
            }
        }
        else if (allso_state == 0)
            if (side !== 1)
                $a[0].src = set_url[0] + sowhata;
            else
                if (side !== 0)
                    $b[0].src = set_url[1] + sowhatb;

        // 防止输入时自动搜索导致浏览器产生多条请求记录
        //location.hash = sowhat_str;
        window.document.title = sowhat_stra + ' - ALLSO';
    }
    else {
        location.hash = '';
        window.document.title = 'ALLSO - 聚合搜索引擎';
    }

    if (need_respond)
        respond();

    $progress.addClass('progress-bar-striped active');
    window.setTimeout(function () {
        $progress.removeClass('progress-bar-striped active');
    }, 2000);
}


$('div.loading').fadeOut('fast');
