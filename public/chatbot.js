(function() {
  const script = document.currentScript;
  const botId = script.getAttribute('data-bot-id');
  if (!botId) return;

  const container = document.createElement('div');
  container.id = 'botai-widget-container';
  document.body.appendChild(container);

  // In a real app, we'd load the React component here.
  // For this demo, we'll assume the widget is part of the same build
  // or we'd use a CDN build of the ChatWidget.
  console.log('BotAI Widget initialized for bot:', botId);
})();
