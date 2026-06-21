# AGENTS.md

## Xpress Engineering Defaults

Fuente canonica: `xpress-index/docs/engineering/code-quality-manifesto.md`.

Cuando Codex edite este repo:

- Resolver el requisito actual con la solucion mas directa que encaje con el codigo existente.
- No agregar composables, stores, wrappers o parametros sin caso de uso actual.
- Extraer conocimiento duplicado solo cuando la regla de negocio sea la misma.
- Si se toca un archivo, dejar una micro-mejora dentro del scope.
- No migrar features legacy solo para normalizar estructura.

Mini feature folder:

- Para modulos nuevos, seguir el patron existente `src/features/<feature>/`.
- Usar subcarpetas solo cuando aporten: `components`, `composables`, `services`, `stores`, `types`, `views`.
- Usar `src/shared` solo para piezas realmente reutilizadas por varios features.
