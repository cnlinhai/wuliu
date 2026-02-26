// 默认数据
const DEFAULT_STATIONS = [
  { station: "上海浦东西转运中心", origin: "上海", destination: "北京" },
  { station: "上海浦东西转运中心", origin: "上海", destination: "广州" },
  { station: "北京大兴转运枢纽", origin: "北京", destination: "上海" },
  { station: "北京大兴转运枢纽", origin: "北京", destination: "成都" },
  { station: "广州白云集散站", origin: "广州", destination: "成都" },
  { station: "广州白云集散站", origin: "广州", destination: "西安" },
  { station: "武汉华中转运仓", origin: "武汉", destination: "西安" },
  { station: "武汉华中转运仓", origin: "武汉", destination: "南京" },
  { station: "成都青白江中转站", origin: "成都", destination: "北京" },
  { station: "西安陆港转运场", origin: "西安", destination: "兰州" }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 处理预检请求
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 获取所有数据
    if (path === '/api/stations' && method === 'GET') {
      try {
        let stations = await env.STATIONS_KV.get('stations', 'json');
        if (!stations) {
          await env.STATIONS_KV.put('stations', JSON.stringify(DEFAULT_STATIONS));
          stations = DEFAULT_STATIONS;
        }
        return new Response(JSON.stringify(stations), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    // 验证密码（新增）
    if (path === '/api/verify-password' && method === 'POST') {
      try {
        const { password } = await request.json();
        const adminPassword = env.ADMIN_PASSWORD;
        if (password === adminPassword) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } else {
          return new Response(JSON.stringify({ success: false, error: '密码错误' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    // 保存数据
    if (path === '/api/stations' && method === 'POST') {
      try {
        const body = await request.json();
        const { password, data } = body;

        const adminPassword = env.ADMIN_PASSWORD;
        if (!password || password !== adminPassword) {
          return new Response(JSON.stringify({ error: '密码错误' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        if (!Array.isArray(data)) {
          return new Response(JSON.stringify({ error: '数据格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        await env.STATIONS_KV.put('stations', JSON.stringify(data));
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};