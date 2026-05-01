## 📌 Observação para o time

```
/ ================= OBSERVAÇÃO PARA O TIME =================
/*
    📌 ORGANIZAÇÃO DO SISTEMA

    Atualmente este arquivo faz:
    - recebe requisição (rota)
    - valida dados
    - aplica regra de negócio
    - executa SQL

    👉 Futuramente podemos separar assim:

    Rota → Lógica → Banco

    - "Lógica" = validações + regras 
    - "Banco" = queries SQL

    Ou seja:
    👉 tudo que for IF, cálculo ou regra → pode virar função separada
*/
```
