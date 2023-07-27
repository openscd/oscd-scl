/* eslint-disable no-use-before-define */
import { isSCLTag } from './tags.js';

function hitemIdentity(e: Element): string {
  return `${e.getAttribute('version')}\t${e.getAttribute('revision')}`;
}

function terminalIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute('connectivityNode')}`;
}

function lNodeIdentity(e: Element): string {
  const [iedName, ldInst, prefix, lnClass, lnInst, lnType] = [
    'iedName',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'lnType',
  ].map(name => e.getAttribute(name));
  if (iedName === 'None')
    return `${identity(e.parentElement)}>(${lnClass} ${lnType})`;
  return `${iedName} ${ldInst || '(Client)'}/${prefix ?? ''} ${lnClass} ${
    lnInst ?? ''
  }`;
}

function kDCIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute(
    'iedName'
  )} ${e.getAttribute('apName')}`;
}

function associationIdentity(e: Element): string {
  const [iedName, ldInst, prefix, lnClass, lnInst] = [
    'iedName',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'lnType',
  ].map(name => e.getAttribute(name));

  return `${identity(e.parentElement)}>${iedName} ${ldInst}/${
    prefix ?? ''
  } ${lnClass} ${lnInst ?? ''}`;
}

function lDeviceIdentity(e: Element): string {
  return `${identity(e.closest('IED')!)}>>${e.getAttribute('inst')}`;
}

function iEDNameIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;

  const iedName = e.textContent;
  const [apRef, ldInst, prefix, lnClass, lnInst] = [
    'apRef',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
  ].map(name => e.getAttribute(name));
  const index = Array.from(e.parentElement.children)
    .filter(
      child =>
        child.getAttribute('apRef') === apRef &&
        child.getAttribute('ldInst') === ldInst &&
        child.getAttribute('prefix') === prefix &&
        child.getAttribute('lnClass') === lnClass &&
        child.getAttribute('lnInst') === lnInst
    )
    .findIndex(child => child.isSameNode(e));

  return `${identity(e.parentElement)}>${iedName} ${apRef || ''} ${
    ldInst || ''
  }/${prefix ?? ''} ${lnClass ?? ''} ${lnInst ?? ''} ${index}`;
}

function fCDAIdentity(e: Element): string {
  const [ldInst, prefix, lnClass, lnInst, doName, daName, fc, ix] = [
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
    'fc',
    'ix',
  ].map(name => e.getAttribute(name));
  const dataPath = `${ldInst}/${prefix ?? ''} ${lnClass} ${
    lnInst ?? ''
  }.${doName} ${daName || ''}`;
  return `${identity(e.parentElement)}>${dataPath} (${fc}${
    ix ? ` [${ix}]` : ''
  })`;
}

function extRefIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  const parentIdentity = identity(e.parentElement);
  const iedName = e.getAttribute('iedName');
  const intAddr = e.getAttribute('intAddr');
  const intAddrIndex = Array.from(
    e.parentElement.querySelectorAll(`ExtRef[intAddr="${intAddr}"]`)
  ).indexOf(e);
  if (!iedName) return `${parentIdentity}>${intAddr}[${intAddrIndex}]`;
  const [
    ldInst,
    prefix,
    lnClass,
    lnInst,
    doName,
    daName,
    serviceType,
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst,
    srcCBName,
  ] = [
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
    'serviceType',
    'srcLDInst',
    'srcPrefix',
    'srcLNClass',
    'srcLNInst',
    'srcCBName',
  ].map(name => e.getAttribute(name));

  const cbPath = srcCBName
    ? `${serviceType}:${srcCBName} ${srcLDInst ?? ''}/${srcPrefix ?? ''} ${
        srcLNClass ?? ''
      } ${srcLNInst ?? ''}`
    : '';
  const dataPath = `${iedName} ${ldInst}/${prefix ?? ''} ${lnClass} ${
    lnInst ?? ''
  } ${doName} ${daName || ''}`;
  return `${parentIdentity}>${cbPath ? `${cbPath} ` : ''}${dataPath}${
    intAddr ? `@${intAddr}` : ''
  }`;
}

function lNIdentity(e: Element): string {
  const [prefix, lnClass, inst] = ['prefix', 'lnClass', 'inst'].map(name =>
    e.getAttribute(name)
  );
  return `${identity(e.parentElement)}>${prefix ?? ''} ${lnClass} ${inst}`;
}

function clientLNIdentity(e: Element): string {
  const [apRef, iedName, ldInst, prefix, lnClass, lnInst] = [
    'apRef',
    'iedName',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
  ].map(name => e.getAttribute(name));
  return `${identity(e.parentElement)}>${iedName} ${apRef || ''} ${ldInst}/${
    prefix ?? ''
  } ${lnClass} ${lnInst}`;
}

function ixNamingIdentity(e: Element): string {
  const [name, ix] = ['name', 'ix'].map(naming => e.getAttribute(naming));
  return `${identity(e.parentElement)}>${name}${ix ? `[${ix}]` : ''}`;
}

function valIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  const sGroup = e.getAttribute('sGroup');
  const index = Array.from(e.parentElement.children)
    .filter(child => child.getAttribute('sGroup') === sGroup)
    .findIndex(child => child.isSameNode(e));
  return `${identity(e.parentElement)}>${sGroup ? `${sGroup}.` : ''} ${index}`;
}

function connectedAPIdentity(e: Element): string {
  const [iedName, apName] = ['iedName', 'apName'].map(name =>
    e.getAttribute(name)
  );
  return `${iedName} ${apName}`;
}

function controlBlockIdentity(e: Element): string {
  const [ldInst, cbName] = ['ldInst', 'cbName'].map(name =>
    e.getAttribute(name)
  );
  return `${ldInst} ${cbName}`;
}

function physConnIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  if (!e.parentElement.querySelector('PhysConn[type="RedConn"]')) return NaN;
  const pcType = e.getAttribute('type');
  if (
    e.parentElement.children.length > 1 &&
    pcType !== 'Connection' &&
    pcType !== 'RedConn'
  )
    return NaN;
  return `${identity(e.parentElement)}>${pcType}`;
}

function pIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  const eParent = e.parentElement;
  const eType = e.getAttribute('type');
  if (eParent.tagName === 'PhysConn')
    return `${identity(e.parentElement)}>${eType}`;
  const index = Array.from(e.parentElement.children)
    .filter(child => child.getAttribute('type') === eType)
    .findIndex(child => child.isSameNode(e));
  return `${identity(e.parentElement)}>${eType} [${index}]`;
}

function enumValIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute('ord')}`;
}

function protNsIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;

  const type = e.getAttribute('type');

  const index = Array.from(e.parentElement.children)
    .filter(
      child =>
        child.tagName === e.tagName && child.getAttribute('type') === type
    )
    .findIndex(child => child.isSameNode(e));

  return `${identity(e.parentElement)}>${type || '8-MMS'}\t${
    e.textContent
  }\t${index}`;
}

function sCLIdentity(): string {
  return '';
}

function namingIdentity(e: Element): string {
  return e.parentElement!.tagName === 'SCL'
    ? e.getAttribute('name')!
    : `${identity(e.parentElement)}>${e.getAttribute('name')}`;
}

function singletonIdentity(e: Element): string {
  return identity(e.parentElement).toString();
}

function idNamingIdentity(e: Element): string {
  return `#${e.id}`;
}

type IdentityFunction = (e: Element) => string | number;

const tags: Record<
  string,
  {
    identity: IdentityFunction;
  }
> = {
  AccessControl: {
    identity: singletonIdentity,
  },
  AccessPoint: {
    identity: namingIdentity,
  },
  Address: {
    identity: singletonIdentity,
  },
  Association: {
    identity: associationIdentity,
  },
  Authentication: {
    identity: singletonIdentity,
  },
  BDA: {
    identity: namingIdentity,
  },
  BitRate: {
    identity: singletonIdentity,
  },
  Bay: {
    identity: namingIdentity,
  },
  ClientLN: {
    identity: clientLNIdentity,
  },
  ClientServices: {
    identity: singletonIdentity,
  },
  CommProt: {
    identity: singletonIdentity,
  },
  Communication: {
    identity: singletonIdentity,
  },
  ConductingEquipment: {
    identity: namingIdentity,
  },
  ConfDataSet: {
    identity: singletonIdentity,
  },
  ConfLdName: {
    identity: singletonIdentity,
  },
  ConfLNs: {
    identity: singletonIdentity,
  },
  ConfLogControl: {
    identity: singletonIdentity,
  },
  ConfReportControl: {
    identity: singletonIdentity,
  },
  ConfSG: {
    identity: singletonIdentity,
  },
  ConfSigRef: {
    identity: singletonIdentity,
  },
  ConnectedAP: {
    identity: connectedAPIdentity,
  },
  ConnectivityNode: {
    identity: namingIdentity,
  },
  DA: {
    identity: namingIdentity,
  },
  DAI: {
    identity: ixNamingIdentity,
  },
  DAType: {
    identity: idNamingIdentity,
  },
  DO: {
    identity: namingIdentity,
  },
  DOI: {
    identity: namingIdentity,
  },
  DOType: {
    identity: idNamingIdentity,
  },
  DataObjectDirectory: {
    identity: singletonIdentity,
  },
  DataSet: {
    identity: namingIdentity,
  },
  DataSetDirectory: {
    identity: singletonIdentity,
  },
  DataTypeTemplates: {
    identity: singletonIdentity,
  },
  DynAssociation: {
    identity: singletonIdentity,
  },
  DynDataSet: {
    identity: singletonIdentity,
  },
  EnumType: {
    identity: idNamingIdentity,
  },
  EnumVal: {
    identity: enumValIdentity,
  },
  EqFunction: {
    identity: namingIdentity,
  },
  EqSubFunction: {
    identity: namingIdentity,
  },
  ExtRef: {
    identity: extRefIdentity,
  },
  FCDA: {
    identity: fCDAIdentity,
  },
  FileHandling: {
    identity: singletonIdentity,
  },
  Function: {
    identity: namingIdentity,
  },
  GeneralEquipment: {
    identity: namingIdentity,
  },
  GetCBValues: {
    identity: singletonIdentity,
  },
  GetDataObjectDefinition: {
    identity: singletonIdentity,
  },
  GetDataSetValue: {
    identity: singletonIdentity,
  },
  GetDirectory: {
    identity: singletonIdentity,
  },
  GOOSE: {
    identity: singletonIdentity,
  },
  GOOSESecurity: {
    identity: namingIdentity,
  },
  GSE: {
    identity: controlBlockIdentity,
  },
  GSEDir: {
    identity: singletonIdentity,
  },
  GSEControl: {
    identity: namingIdentity,
  },
  GSESettings: {
    identity: singletonIdentity,
  },
  GSSE: {
    identity: singletonIdentity,
  },
  Header: {
    identity: singletonIdentity,
  },
  History: {
    identity: singletonIdentity,
  },
  Hitem: {
    identity: hitemIdentity,
  },
  IED: {
    identity: namingIdentity,
  },
  IEDName: {
    identity: iEDNameIdentity,
  },
  Inputs: {
    identity: singletonIdentity,
  },
  IssuerName: {
    identity: singletonIdentity,
  },
  KDC: {
    identity: kDCIdentity,
  },
  LDevice: {
    identity: lDeviceIdentity,
  },
  LN: {
    identity: lNIdentity,
  },
  LN0: {
    identity: singletonIdentity,
  },
  LNode: {
    identity: lNodeIdentity,
  },
  LNodeType: {
    identity: idNamingIdentity,
  },
  Line: {
    identity: namingIdentity,
  },
  Log: {
    identity: namingIdentity,
  },
  LogControl: {
    identity: namingIdentity,
  },
  LogSettings: {
    identity: singletonIdentity,
  },
  MaxTime: {
    identity: singletonIdentity,
  },
  McSecurity: {
    identity: singletonIdentity,
  },
  MinTime: {
    identity: singletonIdentity,
  },
  NeutralPoint: {
    identity: terminalIdentity,
  },
  OptFields: {
    identity: singletonIdentity,
  },
  P: {
    identity: pIdentity,
  },
  PhysConn: {
    identity: physConnIdentity,
  },
  PowerTransformer: {
    identity: namingIdentity,
  },
  Private: {
    identity: () => NaN,
  },
  Process: {
    identity: namingIdentity,
  },
  ProtNs: {
    identity: protNsIdentity,
  },
  Protocol: {
    identity: singletonIdentity,
  },
  ReadWrite: {
    identity: singletonIdentity,
  },
  RedProt: {
    identity: singletonIdentity,
  },
  ReportControl: {
    identity: namingIdentity,
  },
  ReportSettings: {
    identity: singletonIdentity,
  },
  RptEnabled: {
    identity: singletonIdentity,
  },
  SamplesPerSec: {
    identity: singletonIdentity,
  },
  SampledValueControl: {
    identity: namingIdentity,
  },
  SecPerSamples: {
    identity: singletonIdentity,
  },
  SCL: {
    identity: sCLIdentity,
  },
  SDI: {
    identity: ixNamingIdentity,
  },
  SDO: {
    identity: namingIdentity,
  },
  Server: {
    identity: singletonIdentity,
  },
  ServerAt: {
    identity: singletonIdentity,
  },
  Services: {
    identity: singletonIdentity,
  },
  SetDataSetValue: {
    identity: singletonIdentity,
  },
  SettingControl: {
    identity: singletonIdentity,
  },
  SettingGroups: {
    identity: singletonIdentity,
  },
  SGEdit: {
    identity: singletonIdentity,
  },
  SmpRate: {
    identity: singletonIdentity,
  },
  SMV: {
    identity: controlBlockIdentity,
  },
  SmvOpts: {
    identity: singletonIdentity,
  },
  SMVsc: {
    identity: singletonIdentity,
  },
  SMVSecurity: {
    identity: namingIdentity,
  },
  SMVSettings: {
    identity: singletonIdentity,
  },
  SubEquipment: {
    identity: namingIdentity,
  },
  SubFunction: {
    identity: namingIdentity,
  },
  SubNetwork: {
    identity: namingIdentity,
  },
  Subject: {
    identity: singletonIdentity,
  },
  Substation: {
    identity: namingIdentity,
  },
  SupSubscription: {
    identity: singletonIdentity,
  },
  TapChanger: {
    identity: namingIdentity,
  },
  Terminal: {
    identity: terminalIdentity,
  },
  Text: {
    identity: singletonIdentity,
  },
  TimerActivatedControl: {
    identity: singletonIdentity,
  },
  TimeSyncProt: {
    identity: singletonIdentity,
  },
  TransformerWinding: {
    identity: namingIdentity,
  },
  TrgOps: {
    identity: singletonIdentity,
  },
  Val: {
    identity: valIdentity,
  },
  ValueHandling: {
    identity: singletonIdentity,
  },
  Voltage: {
    identity: singletonIdentity,
  },
  VoltageLevel: {
    identity: namingIdentity,
  },
};

/** @returns Identity string for a valid SCL element or NaN */
export function identity(e: Element | null): string | number {
  if (e === null) return NaN;
  if (e.closest('Private')) return NaN;
  const tag = e.tagName;

  if (isSCLTag(tag)) return tags[tag].identity(e);

  return NaN;
}
