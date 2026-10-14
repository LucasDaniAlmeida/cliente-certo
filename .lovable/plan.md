# Edição completa e exclusão de clientes

## O que será feito
- Tornar a linha e o botão de edição do cliente acessíveis ao mesmo formulário.
- Permitir editar nome, nome fantasia, CPF, CNPJ, telefones, situação, observação e datas.
- Validar os dados antes de salvar e atualizar imediatamente a lista e o painel.
- Adicionar uma opção de excluir com confirmação explícita e mensagem de sucesso ou erro.

## Segurança e dados
- Autorizar a exclusão apenas para usuários autenticados com função `admin` ou `operador`, como nas demais ações comerciais.
- Remover o cliente definitivamente somente após confirmação.
- Manter todas as alterações protegidas pelas regras do Supabase e pelas funções autenticadas do aplicativo.

## Validação
- Cobrir a edição completa com testes de validação.
- Conferir o formulário e a confirmação de exclusão no navegador, além do estado final da compilação.
