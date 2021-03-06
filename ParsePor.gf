--# -path=.:../abstract:../common:../api
concrete ParsePor of Parse =
  NounPor - [PPartNP, UseN2, RelNP, DetNP], --*
  VerbPor - [PassV2, ReflVP, ComplVV, SlashV2V, SlashVV, SlashV2VNP], --*
  AdjectivePor - [ReflA2,CAdvAP],
  AdverbPor - [ComparAdvAdj,ComparAdvAdjS,AdnCAdv],
  SentencePor - [EmbedVP],
  QuestionPor,
  RelativePor,
  ConjunctionPor,
  PhrasePor - [UttAP,UttVP],
  TextX - [Temp,Pol,SC,Tense], -- PPos,PNeg,CAdv
  IdiomPor,
  TenseX - [Temp,Pol,SC,Tense], -- PPos,PNeg,CAdv
  ParseExtendPor,
  WordNetPor,
  ConstructionPor,
  DocumentationPor
  ** open MorphoPor, ResPor, ParadigmsPor, IrregPor, (E = ExtendPor), (G = GrammarPor), (C = ConstructX), SentencePor, ExtraPor, Prelude in {

-- INJECT

} ;
