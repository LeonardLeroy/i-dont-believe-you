<p align="center">
  <img src="../../logo.png" alt="i-dont-believe-you" width="140" />
</p>

<p align="center">
  <strong>Votre agent dit que les tests passent. Qu’il le prouve.</strong>
</p>

<p align="center">
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="https://github.com/LeonardLeroy/i-dont-believe-you/actions/workflows/ci.yml"><img src="https://github.com/LeonardLeroy/i-dont-believe-you/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

<p align="center">
  <a href="../../README.md">EN</a> · <strong>FR</strong> · <a href="README.es.md">ES</a>
</p>

## Installation

```bash
mkdir -p .claude/skills/verify-before-claiming && curl -sL https://raw.githubusercontent.com/LeonardLeroy/i-dont-believe-you/main/skills/verify-before-claiming/SKILL.md -o .claude/skills/verify-before-claiming/SKILL.md
```

Codex, Cursor, opencode et les autres : [INSTALL.md](../../INSTALL.md).

## Ce que ça fait

Avant de pouvoir vous annoncer que quoi que ce soit est passé, votre agent doit exécuter six
commandes shell sur le diff réel et en coller la sortie. Si l'une d'elles affiche une ligne, il
n'a pas le droit d'annoncer un succès.

Aucune dépendance, aucune clé d'API, aucun modèle. Un seul fichier markdown.

## Ce que ça change

Même tâche, même agent. À gauche, ce qu'il vous dit aujourd'hui. À droite, ce qu'il est obligé
de vous dire une fois le skill installé.

| Votre agent aujourd'hui | Votre agent avec le skill |
| --- | --- |
| J'ai corrigé la logique de retry.<br><br>✅ Tous les tests passent. Prêt à merger. | J'ai corrigé la logique de retry.<br><br>J'ai lancé le check 1, il affiche :<br><code>+it.skip('resets the backoff', ...</code><br><br>J'ai donc désactivé un test au lieu de le corriger. Le backoff ne se réinitialise toujours pas. Ce n'est pas prêt. |

## Les six checks

| #   | détecte                                                                        |
| --- | ------------------------------------------------------------------------------ |
| 1   | un test désactivé par `.skip`, `@pytest.mark.skip`, `#[ignore]`, `@Disabled`…   |
| 2   | une assertion qui ne peut pas échouer, comme `expect(true).toBe(true)`          |
| 3   | plus d'assertions supprimées qu'ajoutées                                        |
| 4   | un fichier de test supprimé, ou renommé hors du glob du runner                  |
| 5   | une erreur avalée par un `catch` vide ou un `except: pass`                      |
| 6   | « j'ai ajouté des tests » alors qu'aucun fichier de test n'a changé             |

Sur 86 156 patches de test écrits par des agents,
[80,2 % ne portaient aucune assertion explicite, ou des assertions faibles](https://arxiv.org/abs/2606.18168).
Pourquoi ces six : [docs/why.md](../../docs/why.md).

## Adapter

Les commandes dans [`SKILL.md`](../../skills/verify-before-claiming/SKILL.md) sont du `git` et du `grep`
bruts. Ajouter un framework, c'est une regex.

Il y a aussi un CLI optionnel dans [`src/`](../../src) qui exécute les mêmes checks comme garde-fou de
CI, pour quand vous préférez ne pas dépendre de la coopération de l'agent.

## Crédits

Le problème que ces checks adressent est mesuré dans _All Smoke, No Alarm: Oracle Signals in
Agent-Authored Test Code_ de Dipayan Banik, Kowshik Chowdhury et Shazibul Islam Shamim, ainsi que
dans les travaux de METR sur le reward hacking. Les checks eux-mêmes ne viennent pas de ces
articles. Ce sont six choses qu'un diff peut prouver, assez peu coûteuses pour tourner à chaque
tour.

## Licence

[MIT](../../LICENSE). Contributions bienvenues : [CONTRIBUTING.md](../../CONTRIBUTING.md).

Mettez une ⭐ si ça vous a évité un merge de trop derrière un « ✅ All tests pass. »
