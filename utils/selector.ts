/* eslint-disable no-use-before-define */
import { isSCLTag, parentTags, SCLTag } from './tags.js';

export const voidSelector = ':not(*)';

function crossProduct<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (a, b) => <T[][]>a.flatMap(d => b.map(e => [d, e].flat())),
    [[]]
  );
}

function pathParts(identity: string): [string, string] {
  const path = identity.split('>');
  const end = path.pop() ?? '';
  const start = path.join('>');
  return [start, end];
}

export function hitemSelector(tagName: SCLTag, identity: string): string {
  const [version, revision] = identity.split('\t');

  if (!version || !revision) return voidSelector;

  return `${tagName}[version="${version}"][revision="${revision}"]`;
}

export function terminalSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, connectivityNode] = pathParts(identity);

  const parentSelectors = parentTags(tagName).flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  return crossProduct(
    parentSelectors,
    ['>'],
    [`${tagName}[connectivityNode="${connectivityNode}"]`]
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function lNodeSelector(tagName: SCLTag, identity: string): string {
  if (identity.endsWith(')')) {
    const [parentIdentity, childIdentity] = pathParts(identity);
    const [lnClass, lnType] = childIdentity
      .substring(1, childIdentity.length - 1)
      .split(' ');

    if (!lnClass || !lnType) return voidSelector;

    const parentSelectors = parentTags(tagName).flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    );

    return crossProduct(
      parentSelectors,
      ['>'],
      [`${tagName}[iedName="None"][lnClass="${lnClass}"][lnType="${lnType}"]`]
    )
      .map(strings => strings.join(''))
      .join(',');
  }

  const [iedName, ldInst, prefix, lnClass, lnInst] = identity.split(/[ /]/);

  if (!iedName || !ldInst || !lnClass) return voidSelector;

  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
  ] = [
    [`[iedName="${iedName}"]`],
    ldInst === '(Client)'
      ? [':not([ldInst])', '[ldInst=""]']
      : [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
  ];

  return crossProduct(
    [tagName],
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function kDCSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);
  const [iedName, apName] = childIdentity.split(' ');
  return `${selector(
    'IED',
    parentIdentity
  )}>${tagName}[iedName="${iedName}"][apName="${apName}"]`;
}

export function associationSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [iedName, ldInst, prefix, lnClass, lnInst] =
    childIdentity.split(/[ /]/);

  const parentSelectors = parentTags(tagName).flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
  ] = [
    [`[iedName="${iedName}"]`],
    [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function lDeviceSelector(tagName: SCLTag, identity: string): string {
  const [iedName, inst] = identity.split('>>');

  if (!inst) return voidSelector;

  return `IED[name="${iedName}"] ${tagName}[inst="${inst}"]`;
}

export function iEDNameSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [_, apRef, ldInst, prefix, lnClass, lnInst, indexText] =
    childIdentity.split(/[ /]/);
  const index = parseFloat(indexText);

  const [
    parentSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    ixSelectors,
  ] = [
    parentTags(tagName).flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    apRef ? [`[apRef="${apRef}"]`] : [':not([apRef])', '[apRef=""]'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [':not([ldInst])', '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
    index ? [`:nth-child(${index + 1})`] : [''],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function fCDASelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [ldInst, prefix, lnClass, lnInst] = childIdentity.split(/[ /.]/);

  const matchDoDa = childIdentity.match(
    /.([A-Z][A-Za-z0-9.]*) ([A-Za-z0-9.]*) \(/
  );
  const doName = matchDoDa && matchDoDa[1] ? matchDoDa[1] : '';
  const daName = matchDoDa && matchDoDa[2] ? matchDoDa[2] : '';

  const matchFx = childIdentity.match(/\(([A-Z]{2})/);
  const matchIx = childIdentity.match(/ \[([0-9]{1,2})\]/);

  const fc = matchFx && matchFx[1] ? matchFx[1] : '';
  const ix = matchIx && matchIx[1] ? matchIx[1] : '';

  const [
    parentSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    fcSelectors,
    ixSelectors,
  ] = [
    parentTags(tagName).flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
    [`[doName="${doName}"]`],
    daName ? [`[daName="${daName}"]`] : [':not([daName])', '[daName=""]'],
    [`[fc="${fc}"]`],
    ix ? [`[ix="${ix}"]`] : [':not([ix])', '[ix=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    fcSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function extRefSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const parentSelectors = parentTags(tagName).flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  if (childIdentity.endsWith(']')) {
    const [intAddr] = childIdentity.split('[');
    const intAddrSelectors = [`[intAddr="${intAddr}"]`];

    return crossProduct(parentSelectors, ['>'], [tagName], intAddrSelectors)
      .map(strings => strings.join(''))
      .join(',');
  }

  let iedName;
  let ldInst;
  let prefix;
  let lnClass;
  let lnInst;
  let doName;
  let daName;
  let serviceType;
  let srcCBName;
  let srcLDInst;
  let srcPrefix;
  let srcLNClass;
  let srcLNInst;
  let intAddr;

  if (!childIdentity.includes(':') && !childIdentity.includes('@')) {
    [iedName, ldInst, prefix, lnClass, lnInst, doName, daName] =
      childIdentity.split(/[ /]/);
  } else if (childIdentity.includes(':') && !childIdentity.includes('@')) {
    [
      serviceType,
      srcCBName,
      srcLDInst,
      srcPrefix,
      srcLNClass,
      srcLNInst,
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName,
    ] = childIdentity.split(/[ /:]/);
  } else if (!childIdentity.includes(':') && childIdentity.includes('@')) {
    [iedName, ldInst, prefix, lnClass, lnInst, doName, daName, intAddr] =
      childIdentity.split(/[ /@]/);
  } else {
    [
      serviceType,
      srcCBName,
      srcLDInst,
      srcPrefix,
      srcLNClass,
      srcLNInst,
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName,
      intAddr,
    ] = childIdentity.split(/[ /:@]/);
  }

  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    serviceTypeSelectors,
    srcCBNameSelectors,
    srcLDInstSelectors,
    srcPrefixSelectors,
    srcLNClassSelectors,
    srcLNInstSelectors,
    intAddrSelectors,
  ] = [
    iedName ? [`[iedName="${iedName}"]`] : [':not([iedName])'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [':not([ldInst])', '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    lnClass ? [`[lnClass="${lnClass}"]`] : [':not([lnClass])'],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
    doName ? [`[doName="${doName}"]`] : [':not([doName])'],
    daName ? [`[daName="${daName}"]`] : [':not([daName])', '[daName=""]'],
    serviceType
      ? [`[serviceType="${serviceType}"]`]
      : [':not([serviceType])', '[serviceType=""]'],
    srcCBName
      ? [`[srcCBName="${srcCBName}"]`]
      : [':not([srcCBName])', '[srcCBName=""]'],
    srcLDInst
      ? [`[srcLDInst="${srcLDInst}"]`]
      : [':not([srcLDInst])', '[srcLDInst=""]'],
    srcPrefix
      ? [`[srcPrefix="${srcPrefix}"]`]
      : [':not([srcPrefix])', '[srcPrefix=""]'],
    srcLNClass
      ? [`[srcLNClass="${srcLNClass}"]`]
      : [':not([srcLNClass])', '[srcLNClass=""]'],
    srcLNInst
      ? [`[srcLNInst="${srcLNInst}"]`]
      : [':not([srcLNInst])', '[srcLNInst=""]'],
    intAddr ? [`[intAddr="${intAddr}"]`] : [':not([intAddr])', '[intAddr=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    serviceTypeSelectors,
    srcCBNameSelectors,
    srcLDInstSelectors,
    srcPrefixSelectors,
    srcLNClassSelectors,
    srcLNInstSelectors,
    intAddrSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function lNSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const parentSelectors = parentTags(tagName).flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [prefix, lnClass, inst] = childIdentity.split(' ');

  if (!lnClass) return voidSelector;

  const [prefixSelectors, lnClassSelectors, instSelectors] = [
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    [`[inst="${inst}"]`],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    prefixSelectors,
    lnClassSelectors,
    instSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function clientLNSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const parentSelectors = parentTags(tagName).flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [iedName, apRef, ldInst, prefix, lnClass, lnInst] =
    childIdentity.split(/[ /]/);

  const [
    iedNameSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
  ] = [
    iedName ? [`[iedName="${iedName}"]`] : [':not([iedName])', '[iedName=""]'],
    apRef ? [`[apRef="${apRef}"]`] : [':not([apRef])', '[apRef=""]'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [':not([ldInst])', '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    iedNameSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function ixNamingSelector(
  tagName: SCLTag,
  identity: string,
  depth = -1
): string {
  // eslint-disable-next-line no-param-reassign
  if (depth === -1) depth = identity.split('>').length;

  const [parentIdentity, childIdentity] = pathParts(identity);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_0, name, _1, ix] =
    childIdentity.match(/([^[]*)(\[([0-9]*)\])?/) ?? [];

  if (!name) return voidSelector;

  if (depth === 0) return `${tagName}[name="${name}"]`;

  const parentSelectors = parentTags(tagName)
    .flatMap(parentTag =>
      parentTag === 'SDI'
        ? ixNamingSelector(parentTag, parentIdentity, depth - 1).split(',')
        : selector(parentTag, parentIdentity).split(',')
    )
    // eslint-disable-next-line no-shadow
    .filter(selector => !selector.startsWith(voidSelector));

  if (parentSelectors.length === 0) return voidSelector;

  const [nameSelectors, ixSelectors] = [
    [`[name="${name}"]`],
    ix ? [`[ix="${ix}"]`] : ['[ix=""]', ':not([ix])'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    nameSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function valSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [sGroup, indexText] = childIdentity.split(' ');
  const index = parseFloat(indexText);

  const parentSelectors = parentTags(tagName).flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [nameSelectors, ixSelectors] = [
    sGroup ? [`[sGroup="${sGroup}"]`] : [''],
    index ? [`:nth-child(${index + 1})`] : [''],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    nameSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function connectedAPSelector(tagName: SCLTag, identity: string): string {
  const [iedName, apName] = identity.split(' ');
  if (!iedName || !apName) return voidSelector;
  return `${tagName}[iedName="${iedName}"][apName="${apName}"]`;
}

export function controlBlockSelector(
  tagName: SCLTag,
  identity: string
): string {
  const [ldInst, cbName] = identity.split(' ');

  if (!ldInst || !cbName) return voidSelector;

  return `${tagName}[ldInst="${ldInst}"][cbName="${cbName}"]`;
}

export function physConnSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, pcType] = pathParts(identity);

  const [parentSelectors, typeSelectors] = [
    parentTags(tagName).flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    pcType ? [`[type="${pcType}"]`] : [''],
  ];

  return crossProduct(parentSelectors, ['>'], [tagName], typeSelectors)
    .map(strings => strings.join(''))
    .join(',');
}

export function pSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [type] = childIdentity.split(' ');
  const index =
    childIdentity &&
    childIdentity.match(/\[([0-9]+)\]/) &&
    childIdentity.match(/\[([0-9]+)\]/)![1]
      ? parseFloat(childIdentity.match(/\[([0-9]+)\]/)![1])
      : NaN;

  const [parentSelectors, typeSelectors, ixSelectors] = [
    parentTags(tagName).flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    [`[type="${type}"]`],
    index ? [`:nth-child(${index + 1})`] : [''],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    typeSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function enumValSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, ord] = pathParts(identity);
  return `${selector('EnumType', parentIdentity)}>${tagName}[ord="${ord}"]`;
}

export function protNsSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [type, _, indexText] = childIdentity.split('\t');
  const index = parseFloat(indexText);

  const [parentSelectors, typeSelector, ixSelectors] = [
    parentTags(tagName).flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    type && type !== '8-MMS'
      ? [`[type="${type}"]`]
      : [':not([type])', '[type="8-MMS"]'],
    index ? [`:nth-child(${index + 1})`] : [''],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    typeSelector,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

export function sCLSelector(): string {
  return ':root';
}

export function namingSelector(
  tagName: SCLTag,
  identity: string,
  depth = -1
): string {
  // eslint-disable-next-line no-param-reassign
  if (depth === -1) depth = identity.split('>').length;

  const [parentIdentity, name] = pathParts(identity);
  if (!name) return voidSelector;
  if (depth === 0) return `${tagName}[name="${name}"]`;

  // eslint-disable-next-line prefer-destructuring
  const parents = parentTags(tagName) as SCLTag[];
  if (!parents) return voidSelector;

  const parentSelectors = parents
    .flatMap(parentTag =>
      selectorTags[parentTag].selector === selectorTags.Substation.selector
        ? namingSelector(parentTag, parentIdentity, depth - 1).split(',')
        : selector(parentTag, parentIdentity).split(',')
    )
    // eslint-disable-next-line no-shadow
    .filter(selector => !selector.startsWith(voidSelector));

  if (parentSelectors.length === 0) return voidSelector;

  return crossProduct(parentSelectors, ['>'], [tagName], [`[name="${name}"]`])
    .map(strings => strings.join(''))
    .join(',');
}

export function singletonSelector(tagName: SCLTag, identity: string): string {
  // eslint-disable-next-line prefer-destructuring
  const parents = parentTags(tagName) as SCLTag[];
  if (!parents) return voidSelector;

  const parentSelectors = parents
    .flatMap(parentTag => selector(parentTag, identity).split(','))
    // eslint-disable-next-line no-shadow
    .filter(selector => !selector.startsWith(voidSelector));

  if (parentSelectors.length === 0) return voidSelector;

  return crossProduct(parentSelectors, ['>'], [tagName])
    .map(strings => strings.join(''))
    .join(',');
}

export function idNamingSelector(tagName: SCLTag, identity: string): string {
  const id = identity.replace(/^#/, '');

  if (!id) return voidSelector;

  return `${tagName}[id="${id}"]`;
}

type SelectorFunction = (tagName: SCLTag, identity: string) => string;

export const selectorTags: Record<SCLTag, { selector: SelectorFunction }> = {
  AccessControl: {
    selector: singletonSelector,
  },
  AccessPoint: {
    selector: namingSelector,
  },
  Address: {
    selector: singletonSelector,
  },
  Association: {
    selector: associationSelector,
  },
  Authentication: {
    selector: singletonSelector,
  },
  BDA: {
    selector: namingSelector,
  },
  BitRate: {
    selector: singletonSelector,
  },
  Bay: {
    selector: namingSelector,
  },
  ClientLN: {
    selector: clientLNSelector,
  },
  ClientServices: {
    selector: singletonSelector,
  },
  CommProt: {
    selector: singletonSelector,
  },
  Communication: {
    selector: singletonSelector,
  },
  ConductingEquipment: {
    selector: namingSelector,
  },
  ConfDataSet: {
    selector: singletonSelector,
  },
  ConfLdName: {
    selector: singletonSelector,
  },
  ConfLNs: {
    selector: singletonSelector,
  },
  ConfLogControl: {
    selector: singletonSelector,
  },
  ConfReportControl: {
    selector: singletonSelector,
  },
  ConfSG: {
    selector: singletonSelector,
  },
  ConfSigRef: {
    selector: singletonSelector,
  },
  ConnectedAP: {
    selector: connectedAPSelector,
  },
  ConnectivityNode: {
    selector: namingSelector,
  },
  DA: {
    selector: namingSelector,
  },
  DAI: {
    selector: ixNamingSelector,
  },
  DAType: {
    selector: idNamingSelector,
  },
  DO: {
    selector: namingSelector,
  },
  DOI: {
    selector: namingSelector,
  },
  DOType: {
    selector: idNamingSelector,
  },
  DataObjectDirectory: {
    selector: singletonSelector,
  },
  DataSet: {
    selector: namingSelector,
  },
  DataSetDirectory: {
    selector: singletonSelector,
  },
  DataTypeTemplates: {
    selector: singletonSelector,
  },
  DynAssociation: {
    selector: singletonSelector,
  },
  DynDataSet: {
    selector: singletonSelector,
  },
  EnumType: {
    selector: idNamingSelector,
  },
  EnumVal: {
    selector: enumValSelector,
  },
  EqFunction: {
    selector: namingSelector,
  },
  EqSubFunction: {
    selector: namingSelector,
  },
  ExtRef: {
    selector: extRefSelector,
  },
  FCDA: {
    selector: fCDASelector,
  },
  FileHandling: {
    selector: singletonSelector,
  },
  Function: {
    selector: namingSelector,
  },
  GeneralEquipment: {
    selector: namingSelector,
  },
  GetCBValues: {
    selector: singletonSelector,
  },
  GetDataObjectDefinition: {
    selector: singletonSelector,
  },
  GetDataSetValue: {
    selector: singletonSelector,
  },
  GetDirectory: {
    selector: singletonSelector,
  },
  GOOSE: {
    selector: singletonSelector,
  },
  GOOSESecurity: {
    selector: namingSelector,
  },
  GSE: {
    selector: controlBlockSelector,
  },
  GSEDir: {
    selector: singletonSelector,
  },
  GSEControl: {
    selector: namingSelector,
  },
  GSESettings: {
    selector: singletonSelector,
  },
  GSSE: {
    selector: singletonSelector,
  },
  Header: {
    selector: singletonSelector,
  },
  History: {
    selector: singletonSelector,
  },
  Hitem: {
    selector: hitemSelector,
  },
  IED: {
    selector: namingSelector,
  },
  IEDName: {
    selector: iEDNameSelector,
  },
  Inputs: {
    selector: singletonSelector,
  },
  IssuerName: {
    selector: singletonSelector,
  },
  KDC: {
    selector: kDCSelector,
  },
  LDevice: {
    selector: lDeviceSelector,
  },
  LN: {
    selector: lNSelector,
  },
  LN0: {
    selector: singletonSelector,
  },
  LNode: {
    selector: lNodeSelector,
  },
  LNodeType: {
    selector: idNamingSelector,
  },
  Line: {
    selector: namingSelector,
  },
  Log: {
    selector: namingSelector,
  },
  LogControl: {
    selector: namingSelector,
  },
  LogSettings: {
    selector: singletonSelector,
  },
  MaxTime: {
    selector: singletonSelector,
  },
  McSecurity: {
    selector: singletonSelector,
  },
  MinTime: {
    selector: singletonSelector,
  },
  NeutralPoint: {
    selector: terminalSelector,
  },
  OptFields: {
    selector: singletonSelector,
  },
  P: {
    selector: pSelector,
  },
  PhysConn: {
    selector: physConnSelector,
  },
  PowerTransformer: {
    selector: namingSelector,
  },
  Private: {
    selector: () => voidSelector,
  },
  Process: {
    selector: namingSelector,
  },
  ProtNs: {
    selector: protNsSelector,
  },
  Protocol: {
    selector: singletonSelector,
  },
  ReadWrite: {
    selector: singletonSelector,
  },
  RedProt: {
    selector: singletonSelector,
  },
  ReportControl: {
    selector: namingSelector,
  },
  ReportSettings: {
    selector: singletonSelector,
  },
  RptEnabled: {
    selector: singletonSelector,
  },
  SamplesPerSec: {
    selector: singletonSelector,
  },
  SampledValueControl: {
    selector: namingSelector,
  },
  SecPerSamples: {
    selector: singletonSelector,
  },
  SCL: {
    selector: sCLSelector,
  },
  SDI: {
    selector: ixNamingSelector,
  },
  SDO: {
    selector: namingSelector,
  },
  Server: {
    selector: singletonSelector,
  },
  ServerAt: {
    selector: singletonSelector,
  },
  Services: {
    selector: singletonSelector,
  },
  SetDataSetValue: {
    selector: singletonSelector,
  },
  SettingControl: {
    selector: singletonSelector,
  },
  SettingGroups: {
    selector: singletonSelector,
  },
  SGEdit: {
    selector: singletonSelector,
  },
  SmpRate: {
    selector: singletonSelector,
  },
  SMV: {
    selector: controlBlockSelector,
  },
  SmvOpts: {
    selector: singletonSelector,
  },
  SMVsc: {
    selector: singletonSelector,
  },
  SMVSecurity: {
    selector: namingSelector,
  },
  SMVSettings: {
    selector: singletonSelector,
  },
  SubEquipment: {
    selector: namingSelector,
  },
  SubFunction: {
    selector: namingSelector,
  },
  SubNetwork: {
    selector: namingSelector,
  },
  Subject: {
    selector: singletonSelector,
  },
  Substation: {
    selector: namingSelector,
  },
  SupSubscription: {
    selector: singletonSelector,
  },
  TapChanger: {
    selector: namingSelector,
  },
  Terminal: {
    selector: terminalSelector,
  },
  Text: {
    selector: singletonSelector,
  },
  TimerActivatedControl: {
    selector: singletonSelector,
  },
  TimeSyncProt: {
    selector: singletonSelector,
  },
  TransformerWinding: {
    selector: namingSelector,
  },
  TrgOps: {
    selector: singletonSelector,
  },
  Val: {
    selector: valSelector,
  },
  ValueHandling: {
    selector: singletonSelector,
  },
  Voltage: {
    selector: singletonSelector,
  },
  VoltageLevel: {
    selector: namingSelector,
  },
};

export function selector(tagName: string, identity: string | number): string {
  if (typeof identity !== 'string') return voidSelector;

  if (isSCLTag(tagName))
    return selectorTags[tagName].selector(tagName, identity);

  return tagName;
}
