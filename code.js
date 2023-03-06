const message = ({ exterminated }) => {
  const pickOne = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  if (exterminated === 0) {
    return pickOne([
      '0 exports removed. You\'re all good',
      '0 exports removed. No need for the exterminator',
      '0 exports removed. You got this shit under control!  ',
    ]);
  }

  const exportCount = pickOne([
    count(exterminated, 'pesky exports'),
    count(exterminated, 'unwanted exports'),
    count(exterminated, 'exports'),
  ]);

  return pickOne([
    `${exportCount} exterminated`,
    `${exportCount} dealt with`,
    `${exportCount} dealt with. Hooray!`,
    `${exportCount} squashed`,
    `${exportCount} removed. Permanently.`,
    `${exportCount} blown to smithereens`,
    `${exportCount} are now sleeping with the fishes`,
    `${exportCount} won't be heard from again`,
    `${exportCount} removed. They won't bother you again.`,
  ]);
};

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
    let exterminated = 0;

    if (exterminate && isExportable) {
      log(node, `${count(exportSettings.length, 'exports')} exterminated`);
      exterminated += exportSettings.length;
      node.exportSettings = [];
    }

    Promise.all(
      children.map((child) => {
        return visit(child, exterminate || isExportable);
      })
    ).then((reults) => {
      resolve({
        exterminated: reults.reduce((total, { exterminated }) => {
          return total + exterminated;
        }, exterminated)
      });
    });
  });
};

console.log('Exterminate exports:');

visit(figma.currentPage)
  .then((result) => {
    const m = message(result);
    console.log(`- ${m}`);
    figma.notify(m);
  })
  .finally(figma.closePlugin);
