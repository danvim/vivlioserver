export interface CoreViewer {
  readyState: string;
  addListener(type: string, listener: (payload: Payload) => void): void;
  removeListener(type: string, listener: (payload: Payload) => void): void;
  getMetadata(): VMeta;
  showTOC(show: boolean): void;
  getTOC(): TOCItem[];
}

const prefixes = {
  dcterms: 'http://purl.org/dc/terms/',
  meta: 'http://idpf.org/epub/vocab/package/meta/#',
};

export const vMetaTerms = {
  title: `${prefixes.dcterms}title`,
  author: `${prefixes.dcterms}creator`,
  description: `${prefixes.dcterms}description`,
  keywords: `${prefixes.dcterms}subject`,
  language: `${prefixes.dcterms}language`,
  created: `${prefixes.meta}created`,
  date: `${prefixes.meta}date`,
};

type MetaTerms = typeof vMetaTerms;
type MetaValues = MetaTerms[keyof MetaTerms];

export interface VMeta {
  [key: MetaValues]: VMetaItem[] | undefined;
}

export interface VMetaItem {
  v: string;
  o: number;
  s?: string;
  r?: VMeta;
}

export interface TOCItem {
  id: string;
  title: string;
  children: TOCItem[];
}

export interface Payload {
  t: string;
  a?: string;
}
