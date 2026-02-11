// 8개 도구의 params/응답 타입

// === 공통 파라미터 ===

export interface CommonParams {
  nodeId?: string;
  fileKey?: string;
  clientLanguages?: string;
  clientFrameworks?: string;
}

// === 도구별 params ===

export interface ExtractDesignParams extends CommonParams {
  forceCode?: boolean;
  disableCodeConnect?: boolean;
}

export interface GetFigJamParams extends CommonParams {
  includeImagesOfNodes?: boolean;
}

export interface AddCodeConnectMapParams extends CommonParams {
  source: string;
  componentName: string;
  label: string;
  codeConnectLabel?: string;
}

export interface RulesParams {
  clientLanguages?: string;
  clientFrameworks?: string;
}

// === 응답 타입 ===

export interface DesignContext {
  code: string;
  guidance: string[];
}

export interface NodeMetadata {
  xml: string;
  guidance: string;
}

export interface Screenshot {
  data: Buffer;
  mimeType: string;
}

export interface VariableDefs {
  definitions: Record<string, string>;
}

export interface CodeConnectMap {
  mappings: Record<string, { codeConnectSrc: string; codeConnectName: string }>;
}

export interface FigJamContext {
  code: string;
}
