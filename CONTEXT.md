# Forma

Plataforma integrada de saúde, treino e nutrição que conecta alunos a profissionais (personal trainers e nutricionistas) com registro diário, acompanhamento e canais app, web e WhatsApp.

## Language

**User**:
A identidade de autenticação na plataforma — e-mail, senha e sessão. Toda pessoa que acessa o Forma é um User.
_Avoid_: Account, conta

**StudentProfile**:
O perfil de quem registra treino, alimentação e progresso corporal. Extensão opcional de um User.
_Avoid_: Aluno (uso informal na UI), cliente

**ProfessionalProfile**:
O perfil de quem acompanha e prescreve para alunos — personal trainer ou nutricionista. Extensão opcional de um User.
_Avoid_: Profissional (uso informal na UI), prestador

**Papel (role)**:
Conjunto de capacidades ativas derivado dos perfis que o User possui (`student`, `trainer`, `nutritionist`, `admin`). Um User pode ter vários papéis simultaneamente.
_Avoid_: Role fixo, tipo de conta

**Aluno**:
Termo de UI para um User que possui StudentProfile ativo.
_Avoid_: Estudante, usuário final

**Profissional**:
Termo de UI para um User que possui ProfessionalProfile ativo.
_Avoid_: Expert, coach
