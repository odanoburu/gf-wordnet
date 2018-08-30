--# -path=.:../scandinavian:../abstract:../common:../api
concrete ParsePor of Parse =
  NounPor - [PPartNP, UseN2, RelNP, DetNP],
  VerbPor - [PassV2, ReflVP, ComplVV, SlashVV, SlashV2V, SlashV2VNP],
  AdjectivePor - [ReflA2, CAdvAP],
  AdverbPor - [ComparAdvAdj, ComparAdvAdjS, AdnCAdv],
  SentencePor - [EmbedVP],
  QuestionPor,
  RelativePor,
  ConjunctionPor,
  PhrasePor - [UttAP, UttVP],
  TextX -[Tense,Temp],
  IdiomPor,
  TensePor,
  ParseExtendPor,
  WordNetPor,
  ConstructionPor,
  DocumentationPor
  ** open ParadigmsPor, (I = IrregPor), (C = CommonScand), (R = ResPor), (MorphoPor = MorphoPor), (L = LexiconPor), (M = MakeStructuralPor), (E = ExtendPor), (G = GrammarPor), Prelude in {

-- INJECT

} ;
