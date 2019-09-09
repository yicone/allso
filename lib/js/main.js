;(function() {
  const default_state = {
    enginePair: [ 'Ask', '搜狗' ],
    autoSO: true,
    show_side: 2 /* 窗口状态加载 0:左边 1:右边 2:中间 */,
    sync_mode: 0
  }

  function getHash() {
    if (location.hash) return location.hash.substring(1)
    return ''
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=')
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1])
      }
    }
    console.log('Query variable %s not found', variable)
  }

  function EnginesConfig() {
    this.ENGINES = []
  }

  EnginesConfig.prototype.exists = function(engine_key) {
    return this.ENGINES.some(function(element) {
      return element.name == engine_key
    })
  }

  EnginesConfig.prototype.get = function(engine_key) {
    var engine = this.ENGINES.find(function(element) {
      return element.name == engine_key
    })
    return engine
  }

  var app = {
    _state: {},
    _enginesConfig: new EnginesConfig(),
    _set_url: [],
    _set_top: [ 0, 0 ],
    _set_left: [ 0, 0 ],
    _set_foot: [ 0, 0 ],

    $soinput: $('.soinput'),
    $progress: $('div.progress>div'),
    $iframe: $('iframe.search_window'),
    $a: $('#a'),
    $b: $('#b'),

    initState: function() {
      if (localStorage['allso_state'] !== undefined) {
        var data = localStorage['allso_state']
        app._state = JSON.parse(data)
      }
      app._state = $.extend({}, default_state, app._state)
      console.log('launch engines:', app._state.enginePair)
    },

    resizePanel: function() {
      var winw = $('body').width(),
        winh = $(window).height(),
        navh = $('nav.navbar').height(),
        abx = winw / 2

      if (app._state.show_side == 2) {
        app.$a.fadeIn('fast').animate({ 'margin-left': app._set_left[0], width: abx - app._set_left[0] }, 'fast')
        app.$b.fadeIn('fast').animate({ 'margin-left': abx + app._set_left[1], width: abx - app._set_left[1] }, 'fast')
        app.$progress[0].style.width = '50%'
        app.$progress[1].style.width = '50%'
      } else if (app._state.show_side == 0) {
        app.$a.fadeIn('fast').animate({ 'margin-left': app._set_left[0], width: winw - app._set_left[0] }, 'fast')
        app.$b.fadeOut('fast')
        app.$progress[0].style.width = '75%'
        app.$progress[1].style.width = '25%'
      } else {
        app.$a.fadeOut('fast')
        app.$b.fadeIn('fast').animate({ 'margin-left': app._set_left[1], width: winw - app._set_left[0] }, 'fast')
        app.$progress[0].style.width = '25%'
        app.$progress[1].style.width = '75%'
      }

      app.$a.animate(
        {
          'margin-top': app._set_top[0] + navh,
          height: winh - app._set_top[0] - navh + app._set_foot[0]
        },
        'fast'
      )
      app.$b.animate(
        {
          'margin-top': app._set_top[1] + navh,
          height: winh - app._set_top[1] - navh + app._set_foot[1]
        },
        'fast'
      )
    },

    saveState: function() {
      localStorage['allso_state'] = JSON.stringify(app._state)
    },

    onEngineSelected: function(side, engine_key) {
      if (!window.electronFlag && !localStorage['X-Frame-Options']) {
        if ([ 'Google', '微博', 'Evernote' ].indexOf(engine_key) >= 0) {
          $('#myModal').modal('show')
        }
      }

      if (app._enginesConfig.exists(engine_key)) {
        app._state.enginePair[side] = engine_key
        app.saveState()
      } else {
        // 容错
        engine_key = app._state.enginePair[side]
      }

      console.log('engine_key', engine_key)
      var engine = app._enginesConfig.get(engine_key)
      if (engine) {
        app._set_url[side] = engine.url
        app._set_top[side] = engine.offset.top
        app._set_left[side] = engine.offset.left
        app._set_foot[side] = engine.offset.bottom

        $('.engine-brand img').eq(side).attr('src', engine.logo)
      } else {
        throw new Error('no engine selected')
      }

      app.resizePanel()
      app.startSearch(side)
    },
    getUrl: function(i) {
      var keywords = $.trim(app.$soinput[i].value)
      var url = app._set_url[i].replace('${k}', encodeURIComponent(keywords))
      if (app._state.enginePair[i] == 'Evernote') {
        url += '&'
      }
      return url
    },
    doubleSearch: function() {
      app.$a[0].src = app.getUrl(0)

      var keywords = $(app.$soinput[0]).val()
      if (!keywords) return

      var sl, tl
      if (app._state.sync_mode == 1) {
        ;(sl = 'en'), (tl = 'zh-CN')
      } else if (app._state.sync_mode == 2) {
        ;(sl = 'zh-CN'), (tl = 'en')
      } else {
        // 双侧同步模式为普通模式
        $(app.$soinput[1]).val(keywords)
        app.$b[0].src = app.getUrl(1)
        return
      }

      // var translate_url = `http://localhost:3001/api/gtrans?sl=${sl}&tl=${tl}&dt=t&q=${keywords}`;
      var translate_url = `https://romantic-bartik-04cd0f.netlify.com/.netlify/functions/gtrans?sl=${sl}&tl=${tl}&dt=t&q=${keywords}`
      $.ajax({
        url: translate_url,
        dataType: 'text',
        success: function(data) {
          console.log('translate result:', data)
          $(app.$soinput[1]).val(data)
          app.$b[0].src = app.getUrl(1)
        },
        error: function(a, b, c) {
          console.error(a, b, c)
          $(app.$soinput[1]).val(keywords)
          app.$b[0].src = app.getUrl(1)
        }
      })
    },
    // 用例1: 当前双侧，左侧发起，则双侧同时搜索
    // 用例2: 当前双侧，右侧发起，则只右侧搜索
    // 用例3: 当前左侧，左侧发起，则只左侧搜索
    // 用例4: 当前右侧，右侧发起，则只右侧搜索
    // 用例5: 当前左侧，右侧发起，则恢复为双侧，双侧同时搜索
    // 用例6: 当前右侧，左侧发起，则恢复为双侧，双侧同时搜索
    // 用例7: 当不指定搜索侧（如切换同步模式时），如之前为单侧模式，则恢复为双侧，双侧同时搜索
    // 用例8: 当不指定搜索侧（如切换同步模式时），如之前为双侧模式，双侧同时搜索
    startSearch: function(side) {
      var keywords_a = $.trim(app.$soinput[0].value)
      if (keywords_a != '') {
        // 用例8
        if (side == undefined) {
          if (app._state.show_side == 2) {
            side = 0
          }
        }

        if (app._state.show_side != 2) {
          // 用例5和用例6，用例7
          if (side != app._state.show_side) {
            app._state.show_side = 2
            app.saveState()
            app.resizePanel()
            app.doubleSearch()
          } else {
            // 用例3
            if (side == 0) {
              app.$a[0].src = app.getUrl(side)
            } else {
              //用例4
              console.assert(side == 1, '用例4 side should be 1', side)
              app.$b[0].src = app.getUrl(side)
            }
          }
        } else {
          // 用例1
          if (side == 0) {
            app.doubleSearch()
          } else {
            // 用例2
            console.assert(side == 1, '用例2 side should be 1', side)
            app.$b[0].src = app.getUrl(side)
          }
        }

        // 防止输入时自动搜索导致浏览器产生多条请求记录
        //location.hash = sowhat_str;
        window.document.title = keywords_a + ' - 虫洞搜索'
      } else {
        window.document.title = '虫洞搜索 - 享受搜索的乐趣'
      }

      app.$progress.addClass('progress-bar-striped active')
      window.setTimeout(function() {
        app.$progress.removeClass('progress-bar-striped active')
      }, 2000)
    },
    expandPanel: function(side) {
      if (app._state.show_side == 2) {
        app._state.show_side = side
        // 单侧显示时，取消对应侧的左偏移
        app._set_left[side] = 0
      } else {
        app._state.show_side = 2
        // 注释原因：想不起来需要重新触发双侧搜索的case！
        // app.parallelSearch()
      }
      app.saveState()
      app.resizePanel()
    }
  }

  $(function() {
    app.initState()
    app.resizePanel() //启动后的第一次响应

    // 加载搜索引擎列表
    $.get('https://romantic-bartik-04cd0f.netlify.com/.netlify/functions/engines-get-all', function(data) {
      var engines = typeof data == 'string' ? JSON.parse(data) : data
      app._enginesConfig.ENGINES = engines.sort((a, b) => a.group - b.group)
      var $engines = $('.engines')

      $engines.each(function(i) {
        for (var j in app._enginesConfig.ENGINES) {
          var engine = app._enginesConfig.ENGINES[j]
          var side = i
          // var btn_style = btn_styles[side];
          var engine_key = engine.name
          // split showing group
          if (j - 1 >= 0) {
            var prev = app._enginesConfig.ENGINES[j - 1]
            if (engine.group > prev.group) {
              $(this).append(`<li role="separator" class="divider"></li>`)
            }
          }
          var li = `<li><a href="#" data-side="${side}" data-engine-key="${engine_key}">${engine_key}</a></li>`
          $(this).append(li)
        }
      })

      $('.engines a').click(function(e) {
        var side = $(this).attr('data-side')
        var engine_key = $(this).attr('data-engine-key')
        app.onEngineSelected(side, engine_key)
      })

      window.addEventListener('resize', function() {
        app.resizePanel()
      })

      /* 设置初始搜索引擎 */
      for (var i in app._state.enginePair) {
        // var unselected = btn_styles[i];
        // var selected = btn_styles[parseInt(i) + 2];
        // var $buttons = $($engines[i]).find('button');

        var engine_key = app._state.enginePair[i]

        app.onEngineSelected(i, engine_key)
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

        $('div.loading').fadeOut('fast')
      }

      //
      if (location.search) {
        // var hash = getHash();
        // hash = decodeURIComponent(hash).replace(/\+/g, ' ');
        var q = getQueryVariable('q')
        if (q) {
          q = q.replace(/\+/g, ' ').replace(/%20/g, ' ')
          app.$soinput.val(q)
          app.startSearch()
        }
      }
    }).fail(function(err) {
      console.error('获取引擎列表错误', err)
    })

    // 设置初始同步模式
    $($('.sync-mode>a')[app._state.sync_mode]).addClass('btn-danger')

    $($('.modal-footer>button').get(1)).click(function() {
      localStorage['X-Frame-Options'] = true
      $('#myModal').modal('hide')
    })

    /* 搜索按钮事件 */
    // $($soinput[0]).on('input', function () {
    //     var keywords = $(this).val();
    //     $($soinput[1]).val(keywords);
    // });

    app.$soinput.each(function(i) {
      // 监听搜索框内容变化
      $(this).on('input', function() {
        if (app._state.autoSO) {
          app.startSearch(i)
        }
      })

      $(this).bind('enterKey', function(e) {
        var sowhat_str = $(this).val()
        location = location.origin + '?q=' + sowhat_str
        // 左边搜索框点回车，触发右侧搜索
        if (i == 0) {
          app.startSearch(i)
        }
      })
      // 在搜索框点回车
      $(this).keyup(function(e) {
        if (e.keyCode == 13) {
          $(this).trigger('enterKey')
        }
      })
    })

    $('#jdt1').click(function() {
      app.expandPanel(0)
    })
    $('#jdt2').click(function() {
      app.expandPanel(1)
    })

    // 点击切换同步模式
    $('.sync-mode>a').each(function(i) {
      $(this).click({ index: i }, function(e) {
        $('.sync-mode>a').removeClass('btn-danger')
        $(this).addClass('btn-danger')

        app._state.sync_mode = i
        app.saveState()

        app.startSearch()
      })
    })
  })
})()
// { name: [search_url, logo, top, left, foot]}
