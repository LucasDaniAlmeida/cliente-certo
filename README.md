# Cliente Certo

Aplicativo de Gestão de Clientes e Acompanhamento Comercial
Criar um aplicativo web para importar listas de clientes de arquivos Excel, consolidar os dados em uma única lista e acompanhar o resultado dos contatos comerciais.

Os campos do banco vão ser: Nome (TEXT), Nome Fantazia (TEXT), CPF (TEXT), CNPJ (TEXT), Telefone (ARRAY),Status(TEXT), Obs (TEXT), Data_Ultimo_Contato (Date Hour), Data_Agendamento (Date)
1. Importação de planilhas Excel
Criar uma funcionalidade para importar arquivos Excel (.xlsx e .xls) contendo listas de clientes com as seguintes colunas: Nome (TEXT), Nome Fantazia (TEXT), CPF (TEXT), CNPJ (TEXT), Telefone (ARRAY).
•	Permitir selecionar e enviar uma planilha pelo aplicativo.
•	Ler os dados da planilha e incorporar os clientes à lista principal.
•	Preservar os dados originais de cada cliente durante a importação.
•	Evitar duplicidades entre importações. Identificar possíveis clientes repetidos usando os dados disponíveis, priorizando CPF, CNPJ
•	Quando houver possível duplicidade, não criar registros repetidos automaticamente.
•	Informar quantos registros foram importados, quantos foram identificados como duplicados e quantos apresentaram erros.
•	Se as colunas variarem entre arquivos, permitir mapear as colunas da planilha para os campos correspondentes do sistema.
2. Lista consolidada de clientes
Criar uma tela principal com uma tabela contendo todos os clientes importados.
•	Exibir os dados disponíveis nas planilhas.
•	Permitir pesquisar e filtrar clientes.
•	Permitir ordenar a lista pelas colunas.
•	Destacar a situação atual de cada cliente.
•	Permitir abrir um cliente para consultar e editar suas informações de acompanhamento.
•	Na tabela é preciso ter uma coluna para alteração do Status do cliente
A lista deve permanecer consolidada mesmo após novas importações e após o usuário sair e entrar novamente no aplicativo.
3. Status
Para cada cliente, permitir selecionar uma das seguintes situações:
•	Entrar em contato
•	Sem resposta
•	Contato feito
•	Recusado
•	Proposta
•	Agendamento
•	Fechado
Disponibilizar também os seguintes campos editáveis:
•	Observação: texto livre para registrar informações sobre o cliente e o atendimento.
•	Data do último contato: data do contato mais recente.
•	Data do agendamento: data marcada para o próximo atendimento, preenchida quando a situação for Agendamento.
O usuário deve conseguir atualizar o Status diretamente na lista ou no formulário do cliente, com salvamento no banco de dados. A Observação, Data do último contato e Data do agendamento devem ser atualizadas no formulário do cliente.
As alterações precisam permanecer salvas mesmo após atualizar a página ou entrar novamente no aplicativo.
4. Painel de resultados
Criar um painel visual com um gráfico de barras que mostre a quantidade de clientes em cada situação:
•	Entrar em contato
•	Sem resposta
•	Contato feito
•	Recusado
•	Proposta
•	Agendamento
•	Fechado
Exibir a quantidade correspondente a cada situação e atualizar o gráfico automaticamente quando os registros forem alterados ou novas planilhas forem importadas.
Adicionar indicadores resumidos com:
•	Total de clientes cadastrados.
•	Total de clientes com contato feito.
•	Total de clientes sem resposta.
•	Total de clientes que avançaram para proposta.
Todos os números devem ser calculados a partir dos dados reais armazenados no sistema, sem valores fictícios.
5. Interface e usabilidade
Criar uma interface moderna, profissional e simples de utilizar.
•	Disponibilizar navegação clara entre Painel, Clientes e Importação de planilhas.
•	Utilizar uma tabela organizada, com pesquisa e filtros acessíveis.
•	Apresentar as situações com indicadores visuais fáceis de distinguir.
•	Exibir o gráfico de barras em destaque no painel.
•	Garantir que a interface funcione bem em computadores e dispositivos móveis.
6. Persistência e segurança
Será utilizado o banco de dados já existente no supabase que tem duas Roles: admin e operador. Um novo usuário só consegue entrar no app caso tenha um desses 2 roles, caso contrário será redirecionado a uma tela de espera enquanto o admin não atribui um role ao usuário novo.
Utilizar o Supabase para autenticação, banco de dados e armazenamento necessário.
•	Criar uma tela de login com campo de email e senha para login e para se registrar e ter acesso. 
•	Proteger as telas internas para que somente usuários autenticados tenham acesso.
•	Ter uma tela apenas para o admin, que ele consiga atribuir um role ao usuário sem role
•	Armazenar os dados importados e as informações de acompanhamento no banco.
•	Não perder registros já importados ao enviar novas planilhas.
•	Validar os dados antes de gravá-los e apresentar mensagens claras em caso de erro.

Layout
* Ter um layout limpo, sem muita informação

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/befe1ad4-03a2-4f07-9fa4-ab751f016899).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
