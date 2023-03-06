let exterminated = 0;
const log = (node, ...args) => {
  console.log(`- ${name(node)}:`, ...args);
};

const name = (node) => {
  if (!node) {
    return null;
  }
  if (node.type === 'PAGE') {
    return null;
  }

  return [
    name(node.parent),
    `${node.name}`
  ].filter((segment) => {
    return typeof segment === 'string' && segment.length > 0;
  }).join(' / ');
};

const count = (n, plural) => {
  if (n === 1) {
    return `${n} ${plural.replace(/s$/, '')}`;
  }

  return `${n} ${plural}`;
};

const visit = (node, exterminate = false) => {
  return new Promise((resolve) => {
    const children = Array.isArray(node.children) ? node.children : [];
    const exportSettings = node.exportSettings;
    const isExportable = exportSettings.length > 0;

    if (exterminate && isExportable) {
      log(node, `${count(exportSettings.length, 'exports')} exterminated`);
      exterminated += exportSettings.length;
      node.exportSettings = [];
    }

    Promise.all(
      children.map((child) => {
        return visit(child, exterminate || isExportable);
      })
    ).then(() => {
      resolve();
    });

  });
}


console.log('Exterminate exports:');

visit(figma.currentPage)
  .then(() => {
    const message = `${count(exterminated, 'pesky exports')} exterminated`;
    console.log(`- ${message}`);
    figma.notify(message);
  })
  .then(figma.closePlugin);
