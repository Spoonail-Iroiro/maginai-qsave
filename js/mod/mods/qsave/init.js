import maginai from 'maginai';

const logger = maginai.logging.getLogger('plustalk');

maginai.events.gameLoadFinished.addHandler(() => {
  logger.info('Hello, World');
});
