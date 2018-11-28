#ifndef EM_CORE_H
#define EM_CORE_H

#include <gu/seq.h>
#include <gu/map.h>
#include <pgf/pgf.h>

typedef struct {
	prob_t prob;
	prob_t count;
} ProbCount;

typedef struct {
	PgfCId fun;
	ProbCount pc;
	GuMap* mods;
} FunStats;

typedef struct {
	FunStats* stats;
	prob_t prob;
	ProbCount **prob_counts;
} SenseChoice;

typedef struct DepTree {
	size_t index;
	GuBuf* choices;
	size_t n_children;
	struct DepTree* child[0];
} DepTree;

typedef void (*EMRankingCallback)(SenseChoice* choice, GuBuf* buf, DepTree* dtree,
                                  int *res);

typedef struct EMState EMState;

EMState*
em_new_state(PgfPGF* pgf);

void
em_free_state(EMState* state);

void
em_setup_preserve_trees(EMState *state);

void
em_setup_unigram_smoothing(EMState *state, prob_t count);

DepTree*
em_new_dep_tree(EMState* state, DepTree* parent, PgfCId fun, GuString lbl,
                size_t index, size_t n_children);

void
em_add_dep_tree(EMState* state, DepTree* dtree);

int
em_import_treebank(EMState* state, GuString fpath, GuString lang);

int
em_load_model(EMState* state, GuString fpath);

int
em_unigram_count(EMState* state);

int
em_bigram_count(EMState* state);

void
em_set_ranking_callback(EMState* state,
                        PgfCId cat,
                        EMRankingCallback *ranking_callback);

prob_t
em_step(EMState *state);

void
em_dump(EMState *state, char* unigram_path, char* bigram_path);

int
dtree_match_label(GuBuf* buf, DepTree *dtree, GuString lbl);

int
dtree_match_pos(GuBuf* buf, DepTree *dtree, GuString pos);

int
dtree_match_same_choice(SenseChoice *choice, DepTree *dtree);

typedef struct {
	size_t index;
	PgfCId fun;
	prob_t prob;
} EMLemmaProb;

GuBuf*
em_annotate_dep_tree(DepTree* dtree, GuPool* pool);

int
em_export_annotated_treebank(EMState* state, GuString fpath);

#endif
