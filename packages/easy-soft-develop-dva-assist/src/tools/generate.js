/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable no-useless-escape */

const { compile } = require('ejs');
const {
  writeFileSync,
  mkdirSync,
  promptSuccess,
  promptWarn,
  promptEmptyLine,
  isArray,
  checkStringIsEmpty,
  promptInfo,
} = require('easy-soft-develop');

let {
  templateModelContent,
  templateServiceContent,
  templateModelIndexContent,
} = require('../template');

function toLowerFirst(o) {
  return `${o.charAt(0)}`.toLowerCase() + o.slice(1);
}

function toUpperFirst(o) {
  return `${o.charAt(0)}`.toUpperCase() + o.slice(1);
}

function adjustSource(o) {
  const d = { ...o };

  const name = d.name;

  if (name === undefined) {
    promptWarn('data has error, check item: ');

    console.log(d);

    promptEmptyLine();

    throw new Error('data has not key "name"');
  }

  const apis = d.apis;

  if (apis === undefined || !isArray(apis)) {
    promptWarn('data has error, check item: ');

    console.log(d);

    promptEmptyLine();

    throw new Error('data has not key "apis" or not array');
  }

  const pretreatmentSet = new Set();
  const serviceImportSet = new Set();

  for (const one of apis) {
    const serviceFunctionName = one.service;

    if (checkStringIsEmpty(serviceFunctionName)) {
      promptWarn('data has error, check item: ');

      console.log(one);

      promptEmptyLine();

      throw new Error('data has not key "service" or value is empty');
    }

    serviceImportSet.add(serviceFunctionName);

    let functionType = one.type;

    if (checkStringIsEmpty(functionType)) {
      promptWarn('data has error, check item: ');

      console.log(one);

      promptEmptyLine();

      throw new Error('data has not key "type" or value is empty');
    }

    functionType = toLowerFirst(functionType);

    if (functionType === 'singleList') {
      pretreatmentSet.add('pretreatmentRemoteListData');

      one.pretreatment = 'pretreatmentRemoteListData';
    }

    if (functionType === 'pageList') {
      pretreatmentSet.add('pretreatmentRemotePageListData');

      one.pretreatment = 'pretreatmentRemotePageListData';
    }

    if (functionType === 'singleData') {
      pretreatmentSet.add('pretreatmentRemoteSingleData');

      one.pretreatment = 'pretreatmentRemoteSingleData';
    }
  }

  d.defineName = toLowerFirst(d.name);
  d.pretreatmentList = [...pretreatmentSet];
  d.serviceImportList = [...serviceImportSet];
  d.cover = d.cover || false;

  return d;
}

function generate(dataSource, relativeFolder) {
  mkdirSync(`${relativeFolder}/modelBuilders`, {
    recursive: true,
  });

  mkdirSync(`${relativeFolder}/services`, {
    recursive: true,
  });

  promptInfo('model generate config source content');

  console.log(JSON.stringify(dataSource));

  const dataAdjust = dataSource.map((o) => {
    return adjustSource(o);
  });

  promptEmptyLine();
  promptInfo('model generate config adjust content');

  console.log(JSON.stringify(dataAdjust));

  const modelIndex = {
    importList: [],
    execList: [],
  };

  for (const one of dataAdjust) {
    const o = one;

    let contentModel = compile(templateModelContent)({ o });
    let contentService = compile(templateServiceContent)({ o });

    const modelFileGenerateResult = writeFileSync(
      `${relativeFolder}/modelBuilders/${o.defineName}.js`,
      contentModel,
      {
        coverFile: o.cover || false,
      },
    );

    if (modelFileGenerateResult) {
      promptSuccess(
        `Generate "${relativeFolder}/modelBuilders/${o.defineName}.js" complete`,
      );
    }

    const serviceFileGenerateResult = writeFileSync(
      `${relativeFolder}/services/${o.defineName}.js`,
      contentService,
      {
        coverFile: o.cover || false,
      },
    );

    if (serviceFileGenerateResult) {
      promptSuccess(
        `Generate "${relativeFolder}/services/${o.defineName}.js" complete`,
      );
    }

    modelIndex.importList.push({
      model: o.defineName,
      functionAlias: `build${toUpperFirst(o.defineName)}Model`,
    });

    modelIndex.execList.push(`build${toUpperFirst(o.defineName)}Model`);
  }

  let modelIndexContent = compile(templateModelIndexContent)({ o: modelIndex });

  writeFileSync(`${relativeFolder}/modelBuilders/index.js`, modelIndexContent, {
    coverFile: true,
  });

  promptSuccess(`Generate "${relativeFolder}/modelBuilders/index.js" complete`);
}

module.exports = {
  generate,
};
