function getHash() {
  if (location.hash) return location.hash.substring(1);
  return "";
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  console.log("Query variable %s not found", variable);
}

//常用变量
const $soinput = $(".soinput"),
  $progress = $("div.progress>div"),
  $iframe = $("iframe.search_window"),
  $a = $("#a"),
  $b = $("#b"),
  // { name: [search_url, logo, top, left, foot]}
  engines = [
    {
      Google: [
        "https://www.google.com/search?q=",
        "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        -76,
        -120,
        87
      ]
    },
    {
      Ask: [
        "https://www.search.ask.com/web?q=",
        "https://www.search.ask.com/assets/b/a-logo-small.png",
        -60,
        -120,
        120
      ]
    },
    {
      Quora: [
        "https://www.quora.com/search?q=",
        "https://qsf.ec.quoracdn.net/-3-images.logo.wordmark_default.svg-26-32753849bf197b54.svg",
        0,
        0,
        0
      ]
    },
    {
      搜狗: [
        "https://www.sogou.com/web?query=",
        "https://img01.sogoucdn.com/app/a/100520122/0c6aeb64_jieguo.png",
        0,
        0,
        127
      ]
    },
    {
      必应: [
        "https://cn.bing.com/search?setmkt=zh-cn&setlang=zh-cn&q=",
        "https://cn.bing.com/sa/simg/CN_Logo_Gray.png",
        -72,
        -80,
        60
      ]
    },
    {
      微博: [
        "http://s.weibo.com/weibo/",
        "http://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo.png?id=1404211047727",
        -180,
        0,
        163
      ]
    },
    {
      "360搜索": [
        "https://www.haosou.com/s?q=",
        "https://p.ssl.qhimg.com/t0184e4ce3cb83220c1.png",
        0,
        -10,
        80
      ]
    },
    {
      百度: [
        "https://www.baidu.com/s?wd=",
        "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
        -45,
        -90,
        70
      ]
    },
    {
      GitHub: [
        "https://github.com/search?q=",
        "http://www.hack.institute/events/connected-car/img/github-logo-white.png",
        -130,
        0,
        200
      ]
    },
    {
      Instapaper: [
        "https://www.instapaper.com/search?q=",
        "https://qph.ec.quoracdn.net/main-qimg-81323e136c3a148d9d74ac3ed060b4c2",
        0,
        0,
        0
      ]
    },
    {
      Evernote: [
        "https://www.evernote.com/Home.action#ses=1&sh=5&sds=5&x=",
        "https://evernote.com/media/img/brand-guide/evernote-logos/Evernote_H.png",
        0,
        0,
        0
      ]
    },
    {
      Wunderlist: [
        "https://www.wunderlist.com/webapp#/search/",
        "https://dr0wv9n0kx6h5.cloudfront.net/664cb69d34d0ef040ff8a446e429bce8feb54b41/site/images/logo-big.png",
        0,
        0,
        0
      ]
    }
  ];
var need_scale = true;
var set_url = [],
  set_top = [0, 0],
  set_left = [0, 0],
  set_foot = [0, 0];
var $engines = $(".engines");

const default_state = {
  engines: ["Ask", "搜狗"],
  autoSO: true,
  show_side: 2 /* 窗口状态加载 0:左边 1:右边 2:中间 */,
  sync_mode: 0
};

var state = $.extend({}, default_state);

function saveState() {
  localStorage["allso_state"] = JSON.stringify(state);
}

if (localStorage["allso_state"] !== undefined) {
  var data = localStorage["allso_state"];
  state = JSON.parse(data);
}

console.log("launch engines:", state.engines);

scale(); //启动后的第一次响应式

$engines.each(function(i) {
  for (var j in engines) {
    var engine = engines[j];
    var side = i;
    // var btn_style = btn_styles[side];
    var engine_key = Object.keys(engine)[0];
    // var btn = `<button type="button" class="btn ${btn_style}" onclick="set(${side},'${engine_key}')">${engine_key}</button>&nbsp;`;
    var li = `<li><a onclick="set(${side},'${engine_key}'); doSearch(${side});">${engine_key}</a></li>`;
    $(this).append(li);
    // todo: 消除该硬编码
    if (engine_key == "百度" || engine_key == "Quora" || engine_key == "GitHub") {
      $(this).append(`<li role="separator" class="divider"></li>`);
    }
  }
});

// 设置初始同步模式
$($(".sync-mode>a")[state.sync_mode]).addClass("btn-danger");

/* 设置初始搜索引擎 */
for (var i in state.engines) {
  // var unselected = btn_styles[i];
  // var selected = btn_styles[parseInt(i) + 2];
  // var $buttons = $($engines[i]).find('button');

  var engine_key = state.engines[i];

  set(i, engine_key);
  // var $button = $buttons.eq(engine_key);
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

function isEngineExist(engine_key) {
  return engines.some(function(element) {
    return Object.keys(element) == engine_key;
  });
}

function getEngineConfig(engine_key) {
  var engine = engines.find(function(element) {
    return Object.keys(element) == engine_key;
  });
  return engine[engine_key];
}

$($(".modal-footer>button").get(1)).click(function() {
  localStorage["X-Frame-Options"] = true;
  $("#myModal").modal("hide");
});

function set(side, engine_key) {
  if (!localStorage["X-Frame-Options"]) {
    if (["Google", "微博", "Evernote"].indexOf(engine_key) >= 0) {
      $("#myModal").modal("show");
    }
  }

  if (isEngineExist(engine_key)) {
    state.engines[side] = engine_key;
    saveState();
  } else {
    engine_key = state.engines[side];
  }

  var engine_config = getEngineConfig(engine_key);

  set_url[side] = engine_config[0];
  set_top[side] = engine_config[2];
  set_left[side] = engine_config[3];
  set_foot[side] = engine_config[4];

  $(".engine-brand img").eq(side).attr("src", engine_config[1]);

  need_scale = true;
}

function doSearch(side) {
  console.log("search", side);

  var keywords_a = $.trim($soinput[0].value);
  if (keywords_a !== "") {
    // 单侧显示，但发起搜索的是另一侧或者两侧同时
    if (state.show_side !== 2 && side !== state.show_side) {
      state.show_side = 2;
      // saveState();
      scale();
    }

    if (side === 0) {
      $a[0].src = getUrl(0);
    } else {
      if (side === undefined) {
        $a[0].src = getUrl(0);
      }

      rightSearch();
    }

    // 防止输入时自动搜索导致浏览器产生多条请求记录
    //location.hash = sowhat_str;
    window.document.title = keywords_a + " - 虫洞搜索";
  } else {
    location = location.origin + "?q=";
    window.document.title = "虫洞搜索 - 享受搜索的乐趣";
  }

  if (need_scale) scale();

  $progress.addClass("progress-bar-striped active");
  window.setTimeout(function() {
    $progress.removeClass("progress-bar-striped active");
  }, 2000);
}

/* 响应 Hash */
(function() {
  if (location.search) {
    // var hash = getHash();
    // hash = decodeURIComponent(hash).replace(/\+/g, ' ');
    var q = getQueryVariable("q");
    $soinput.val(q);
    doSearch();
  }
})();

/*状态点击改变*/
function change_state(is_zuo) {
  var side = is_zuo ? 0 : 1;
  if (state.show_side == 2) {
    state.show_side = side;
    // 单边显示时，取消左偏移
    set_left[side] = 0;
  } else {
    state.show_side = 2;
    // todo: 恢复左偏移
  }

  // saveState();
  scale();

  if (state.show_side == 2) doSearch();
}

/* 响应式 */
$(window).resize(function() {
  scale();
});

function scale() {
  var winw = $("body").width(),
    winh = $(window).height(),
    navh = $("nav.navbar").height(),
    abx = winw / 2;

  if (state.show_side == 2) {
    $a
      .fadeIn("fast")
      .animate(
        { "margin-left": set_left[0], width: abx - set_left[0] },
        "fast"
      );
    $b
      .fadeIn("fast")
      .animate(
        { "margin-left": abx + set_left[1], width: abx - set_left[1] },
        "fast"
      );
    $progress[0].style.width = "50%";
    $progress[1].style.width = "50%";
  } else if (state.show_side == 0) {
    $a
      .fadeIn("fast")
      .animate(
        { "margin-left": set_left[0], width: winw - set_left[0] },
        "fast"
      );
    $b.fadeOut("fast");
    $progress[0].style.width = "75%";
    $progress[1].style.width = "25%";
  } else {
    $a.fadeOut("fast");
    $b
      .fadeIn("fast")
      .animate(
        { "margin-left": set_left[1], width: winw - set_left[0] },
        "fast"
      );
    $progress[0].style.width = "25%";
    $progress[1].style.width = "75%";
  }

  $a.animate(
    {
      "margin-top": set_top[0] + navh,
      height: winh - set_top[0] - navh + set_foot[0]
    },
    "fast"
  );
  $b.animate(
    {
      "margin-top": set_top[1] + navh,
      height: winh - set_top[1] - navh + set_foot[1]
    },
    "fast"
  );

  need_scale = false;
}

/* 搜索按钮事件 */
// $($soinput[0]).on('input', function () {
//     var keywords = $(this).val();
//     $($soinput[1]).val(keywords);
// });

$soinput.each(function(i) {
  // 搜索框内容变化
  $(this).on("input", function() {
    if (state.autoSO) {
      // 左边搜索框内容变化，两侧同时搜索；否则只右侧搜索
      i == 0 ? doSearch() : rightSearch();
    }
  });

  $(this).bind("enterKey", function(e) {
    var sowhat_str = $(this).val();
    location = location.origin + "?q=" + sowhat_str;
    // 左边搜索框点回车，触发右侧搜索
    if (i == 0) {
      rightSearch();
    }
  });
  // 在搜索框点回车
  $(this).keyup(function(e) {
    if (e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
});

$(".sync-mode>a").each(function(i) {
  $(this).click({ index: i }, function(e) {
    $(".sync-mode>a").removeClass("btn-danger");
    $(this).addClass("btn-danger");

    state.sync_mode = i;
    saveState();

    rightSearch();
  });
});

function rightSearch() {
  var keywords = $($soinput[0]).val();
  if (!keywords) return;

  var sl, tl;
  if (state.sync_mode == 1) {
    (sl = "en"), (tl = "zh-CN");
  } else if (state.sync_mode == 2) {
    (sl = "zh-CN"), (tl = "en");
  } else {
    $($soinput[1]).val(keywords);
    $b[0].src = getUrl(1);
    return;
  }

  // var translate_url = `http://localhost:3001/api/gtrans?sl=${sl}&tl=${tl}&dt=t&q=${keywords}`;
  var translate_url = `http://api.gadn.in/gtrans?sl=${sl}&tl=${tl}&dt=t&q=${keywords}`;
  $.ajax({
    url: translate_url,
    dataType: "text",
    success: function(data) {
      // console.log('translate result:', data)
      var obj = eval(data);
      var r = obj[0][0][0];
      $($soinput[1]).val(r);
      $b[0].src = getUrl(1);
    },
    error: function(a, b, c) {
      console.error(a, b, c);
      $($soinput[1]).val(keywords);
      $b[0].src = getUrl(1);
    }
  });
}

function getUrl(i) {
  var keywords = $.trim($soinput[i].value);
  var url = set_url[i] + encodeURIComponent(keywords);
  if (state.engines[i] == "Evernote") {
    url += "&";
  }
  return url;
}

$("div.loading").fadeOut("fast");
