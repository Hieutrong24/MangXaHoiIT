const endpointRules = [
  {
    match: /^\/api\/auth|^\/auth/,
    service: 'Auth Service',
    database: 'Auth SQL Server',
    protocol: 'HTTP/REST',
    action: 'Authenticate user',
    result: 'JWT created',
  },
  {
    match: /^\/api\/users|^\/users/,
    service: 'User Service',
    database: 'User SQL Server',
    protocol: 'HTTP/REST',
    action: 'User/profile operation',
    result: 'profile updated',
  },
  {
    match: /^\/api\/content\/.*comments|^\/content\/.*comments/,
    service: 'Content Service',
    database: 'Content MongoDB',
    protocol: 'HTTP/REST',
    action: 'Comment on post',
    eventName: 'comment.created',
    broker: 'RabbitMQ',
    result: 'comment saved',
  },
  {
    match: /^\/api\/content|^\/content/,
    service: 'Content Service',
    database: 'Content MongoDB',
    protocol: 'HTTP/REST',
    action: 'Content operation',
    result: 'content saved',
  },
  {
    match: /^\/api\/chats|^\/chats/,
    service: 'Chat Service',
    database: 'Chat MongoDB',
    protocol: 'HTTP/REST',
    action: 'Chat operation',
    result: 'message saved',
  },
  {
    match: /^\/api\/notifications|^\/notifications/,
    service: 'Notification Service',
    database: 'Notification MongoDB',
    protocol: 'HTTP/REST',
    action: 'Notification operation',
    result: 'notification sent',
  },
  {
    match: /^\/api\/code|^\/code/,
    service: 'Code Judge Service',
    database: 'Judge SQL Server / Judge MongoDB',
    protocol: 'HTTP/REST',
    action: 'Code Judge operation',
    externalService: 'Judge0 / Judge Runner',
    result: 'verdict received',
  },
  {
    match: /^\/api\/uploads|^\/uploads/,
    service: 'Content Service',
    database: 'Cloudinary + Content MongoDB',
    protocol: 'HTTP/REST',
    action: 'Upload media',
    externalService: 'Cloudinary',
    result: 'Cloudinary URL returned',
  },
  {
    match: /^\/api\/ai|^\/ai/,
    service: 'Content Service AI Module',
    database: 'Content MongoDB',
    protocol: 'HTTP/REST',
    action: 'AI suggestion',
    externalService: 'AI API',
    result: 'AI response received',
  },
  {
    match: /^\/api\/external|^\/external|hacker-news|dev\.to|nvd\.nist\.gov/i,
    service: 'External Service Adapter',
    database: 'External API',
    protocol: 'External API',
    action: 'Fetch external IT data',
    externalService: 'Hacker News / DEV.to / NVD',
    result: 'external data received',
  },
  {
    match: /^\/api\/admin\/auth|^\/admin\/auth/,
    service: 'Admin Module / Auth Service',
    database: 'Auth SQL Server',
    protocol: 'HTTP/REST',
    action: 'Admin auth operation',
    result: 'admin action completed',
  },
  {
    match: /^\/api\/admin\/users|^\/admin\/users/,
    service: 'Admin Module / User Service',
    database: 'User SQL Server',
    protocol: 'HTTP/REST',
    action: 'Admin user operation',
    result: 'admin action completed',
  },
  {
    match: /^\/api\/admin\/content|^\/api\/admin\/jobs|^\/admin\/content|^\/admin\/jobs/,
    service: 'Admin Module / Content Service',
    database: 'Content MongoDB',
    protocol: 'HTTP/REST',
    action: 'Admin content operation',
    result: 'admin action completed',
  },
  {
    match: /^\/api\/admin\/chat|^\/admin\/chat/,
    service: 'Admin Module / Chat Service',
    database: 'Chat MongoDB',
    protocol: 'HTTP/REST',
    action: 'Admin chat operation',
    result: 'admin action completed',
  },
  {
    match: /^\/api\/admin\/notifications|^\/admin\/notifications/,
    service: 'Admin Module / Notification Service',
    database: 'Notification MongoDB',
    protocol: 'HTTP/REST',
    action: 'Admin notification operation',
    result: 'admin action completed',
  },
  {
    match: /^\/api\/admin\/code|^\/api\/admin\/learning|^\/admin\/code|^\/admin\/learning/,
    service: 'Admin Module / Code Judge Service',
    database: 'Judge SQL Server / Judge MongoDB',
    protocol: 'HTTP/REST',
    action: 'Admin Code Judge operation',
    result: 'admin action completed',
  },
  {
    match: /^\/api\/admin|^\/admin/,
    service: 'Admin Module / API Gateway',
    database: 'Service database by route',
    protocol: 'HTTP/REST',
    action: 'Admin route',
    result: 'admin action completed',
  },
];

const socketRules = [
  {
    match: /message|chat/i,
    service: 'Chat Service',
    database: 'Chat MongoDB',
    protocol: 'WebSocket/Socket.IO',
    action: 'Realtime chat',
    result: 'message delivered',
  },
  {
    match: /notification/i,
    service: 'Notification Service',
    database: 'Notification MongoDB',
    protocol: 'WebSocket/Socket.IO',
    action: 'Realtime notification',
    result: 'unread count updated',
  },
  {
    match: /presence/i,
    service: 'Chat Service',
    database: 'Chat MongoDB',
    protocol: 'WebSocket/Socket.IO',
    action: 'Presence sync',
    result: 'presence updated',
  },
  {
    match: /call:/i,
    service: 'Chat Service',
    database: 'Signaling state',
    protocol: 'WebSocket/Socket.IO',
    action: 'Call signaling',
    result: 'signal delivered',
  },
  {
    match: /comment\.created|post\.liked/i,
    service: 'Content Service -> RabbitMQ -> Notification Service',
    database: 'Content MongoDB / Notification MongoDB',
    protocol: 'AMQP + WebSocket/Socket.IO',
    action: 'Content event',
    broker: 'RabbitMQ',
    result: 'notification created',
  },
  {
    match: /friend\.request/i,
    service: 'User Service -> RabbitMQ -> Notification Service',
    database: 'User SQL Server / Notification MongoDB',
    protocol: 'AMQP + WebSocket/Socket.IO',
    action: 'Friend request event',
    broker: 'RabbitMQ',
    result: 'notification created',
  },
  {
    match: /submission\.judged|code-result/i,
    service: 'Code Judge Service / Judge Runner',
    database: 'Judge SQL Server / Judge MongoDB',
    protocol: 'AMQP + WebSocket/Socket.IO',
    action: 'Judge result event',
    broker: 'RabbitMQ',
    result: 'verdict received',
  },
];

function normalizeEndpoint(input = '') {
  const raw = String(input || '');
  try {
    const url = new URL(raw, window.location.origin);
    return url.pathname.startsWith('/api') ? url.pathname : url.pathname;
  } catch {
    const [path] = raw.split('?');
    return path || raw;
  }
}

export function getHttpArchitecture(url = '') {
  const endpoint = normalizeEndpoint(url);
  const source = `${endpoint} ${url}`;
  const rule = endpointRules.find((item) => item.match.test(source));
  return {
    endpoint,
    service: rule?.service || 'API Gateway',
    database: rule?.database || 'Service database',
    protocol: rule?.protocol || 'HTTP/REST',
    userAction: rule?.action || 'API request',
    eventName: rule?.eventName,
    broker: rule?.broker,
    externalService: rule?.externalService,
    result: rule?.result || 'request completed',
  };
}

export function getSocketArchitecture(eventName = '') {
  const rule = socketRules.find((item) => item.match.test(String(eventName || '')));
  return {
    service: rule?.service || 'Realtime Gateway',
    database: rule?.database || 'Realtime state',
    protocol: rule?.protocol || 'WebSocket/Socket.IO',
    userAction: rule?.action || 'Realtime event',
    broker: rule?.broker,
    result: rule?.result || 'near realtime',
  };
}

export function getLogKindFromArchitecture(meta = {}) {
  if (meta.broker) return 'Event';
  if (meta.protocol === 'External API') return 'External Service';
  return 'HTTP';
}
