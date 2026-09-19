<p align="center">
  <img src="../logo.png" alt="i-dont-believe-you" width="140" />
</p>

<p align="center">
  <strong>Tu agente dice que las pruebas pasan. Haz que lo demuestre.</strong>
</p>

<p align="center">
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="https://github.com/LeonardLeroy/i-dont-believe-you/actions/workflows/ci.yml"><img src="https://github.com/LeonardLeroy/i-dont-believe-you/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

<p align="center">
  <a href="../../README.md">EN</a> · <a href="README.fr.md">FR</a> · <strong>ES</strong>
</p>

## Instalación

```bash
mkdir -p .claude/skills/verify-before-claiming && curl -sL https://raw.githubusercontent.com/LeonardLeroy/i-dont-believe-you/main/skills/verify-before-claiming/SKILL.md -o .claude/skills/verify-before-claiming/SKILL.md
```

Codex, Cursor, opencode y los demás: [INSTALL.md](../../INSTALL.md).

## Qué hace

Antes de poder decirte que algo ha pasado, tu agente tiene que ejecutar ocho comandos de shell
sobre el diff real y pegar su salida. Si uno de ellos imprime una línea, no tiene permiso para
declarar éxito.

Sin dependencias, sin clave de API, sin modelo. Un solo archivo markdown.

## Qué cambia

La misma tarea, el mismo agente. A la izquierda, lo que te dice hoy. A la derecha, lo que se ve
obligado a decirte con la skill instalada.

| Tu agente hoy | Tu agente con la skill |
| --- | --- |
| He arreglado la lógica de reintentos.<br><br>✅ Todas las pruebas pasan. Listo para fusionar. | He arreglado la lógica de reintentos.<br><br>He ejecutado la comprobación 1 y ha impreso:<br><code>+it.skip('resets the backoff', ...</code><br><br>Así que he desactivado una prueba en lugar de arreglarla. El backoff sigue sin reiniciarse. No está listo. |

## Las ocho comprobaciones

| #   | detecta                                                                         |
| --- | ------------------------------------------------------------------------------- |
| 1   | una prueba desactivada con `.skip`, `@pytest.mark.skip`, `#[ignore]`, `@Disabled`… |
| 2   | una aserción que no puede fallar, como `expect(true).toBe(true)`                 |
| 3   | más aserciones eliminadas que añadidas                                           |
| 4   | un archivo de pruebas borrado, o renombrado fuera del glob del runner            |
| 5   | un error silenciado por un `catch` vacío o un `except: pass`                     |
| 6   | «he añadido pruebas» cuando ningún archivo de pruebas ha cambiado                |
| 7   | una prueba con nombre que existía antes y ya no existe                           |
| 8   | una prueba enfocada con `.only`, que impide que el resto del archivo se ejecute  |

De 86 156 parches de pruebas escritos por agentes,
[el 80,2 % no contenía aserciones explícitas, o solo aserciones débiles](https://arxiv.org/abs/2606.18168).
Por qué estas ocho: [docs/why.md](../../docs/why.md).

## Ajustarlo

Los comandos de [`SKILL.md`](../../skills/verify-before-claiming/SKILL.md) son `git` y `grep` puros.
Añadir un framework es una expresión regular.

También hay una CLI opcional en [`src/`](../../src) que ejecuta las mismas comprobaciones como barrera
en CI, para cuando prefieras no depender de que el agente coopere.

## Créditos

El problema que estas comprobaciones abordan está medido en _All Smoke, No Alarm: Oracle Signals
in Agent-Authored Test Code_ de Dipayan Banik, Kowshik Chowdhury y Shazibul Islam Shamim, y en el
trabajo de METR sobre reward hacking. Las comprobaciones en sí no salen de esos artículos. Son
ocho cosas que un diff puede demostrar, lo bastante baratas como para ejecutarlas en cada turno.

## Licencia

[MIT](../../LICENSE). Las contribuciones son bienvenidas: [CONTRIBUTING.md](../../CONTRIBUTING.md).

Pon una ⭐ si te ha ahorrado una fusión de más detrás de un «✅ All tests pass.»
