## About > Concept

Garantir que cada criança e adolescente dos 4 aos 17 anos esteja na escola – e aprendendo – é, hoje, um dos principais desafios do Brasil. Também é parte da Agenda 2030 das Nações Unidas, um conjunto de programas, ações e diretrizes que devem ser implantados por todos os países nos próximos 15 anos para alcançar o desenvolvimento sustentável.

Pensando nisso, o UNICEF, a União Nacional dos Dirigentes Municipais de Educação (Undime), o Colegiado Nacional de Gestores Municipais de Assistência Social (Congemas) e o Instituto TIM desenvolveram o Projeto de Busca Ativa de Crianças e Adolescentes. O projeto disponibiliza gratuitamente aos municípios uma suite de ferramentas digitais e uma metodologia social que permitem à sociedade local (governos municipais) fazer com que isso aconteça na prática.

Como o município é o lugar no qual as políticas públicas realmente se concretizam a partir das demandas da população, é importante que os governos (municipal, estadual e federal) e as organizações da sociedade civil organizada se mobilizem para colocar na escola cada criança e adolescente que nunca estudou ou que abandonou os estudos em algum momento de sua trajetória.

O Projeto de Busca Ativa de Crianças e Adolescentes cria condições práticas para que cada comunidade se engaje pelo fim da exclusão escolar.

Batendo de porta em porta e mapeando os motivos da exclusão/evasão, vamos conseguir colocar cada uma dessas crianças e adolescentes na escola. A intenção é entender, na prática, por que isso ocorre, possibilitando a realização de políticas coordenadas de forma intersetorial para evitar que os casos voltem a se repetir.

## About > Technical 

Frontend em Angular da aplicação [Busca Ativa Escolar API](https://github.com/lqdi/busca-ativa-escolar-api).

### Related Projects

* API 
  * https://github.com/institutotim/busca-ativa-escolar-api
* Web panel frontend (this)
  * https://github.com/lqdi/busca-ativa-escolar-web
* Landing Page
  * https://github.com/lqdi/busca-ativa-escolar-lp
* App Mobile cross-plataform
  * https://github.com/lqdi/busca-ativa-escolar-mobile
* Alert Page
  * https://github.com/lqdi/busca-ativa-escolar-alert-page

## Doc
Toda documentação da aplicação está na pasta [doc](https://github.com/institutotim/busca-ativa-escolar-api/tree/master/doc) do repositório da api. Esta aplicação usa o Jekyll como engine de documentação.

### Software > Requirements
Lista dos principais softwares que compõe e aplicação. Maiores detalhes, ver documentação de [instalação](doc/deploy.md) ou [guia do desenvolvedor](doc/developer_guide.md).

- [Ubuntu Server >= 16.04](http://www.ubuntu.com) ou [Debian Server >= 8](https://www.debian.org.)
- [PHP >= 7.1](http://php.net)
	- [Composer](https://getcomposer.org)
	- [Laravel = 5.3](https://laravel.com)
- [MariaDB >= 5.5](https://www.mariadb.org/)
- [Memcached >= 1.4](https://memcached.org)


### Hardhare > Requirements

Benchmark recomendado para ambiente de produção com capacidade de gestão de até 50k registros:

*  4 cores de CPU;
* 4gb de RAM;
* 100mbit de rede;

Benchmark recomendado para ambiente de produção com capacidade de gestão de até 1m registros:

* 8 cores de CPU
* 8gb de RAM
* 500mbit de rede

Vale lembrar que os requisitos de hardware podem variar de acordo com a latência da rede, velocidade dos cores dos cpus, uso de proxies, entre outros fatores. Recomendamos aos sysadmin da rede em que a aplicação será instalada um monitoramento de tráfego e uso durante o período de 6 meses a 1 ano para avaliação de cenário de uso.


### Dev Enviroment
* https://plataforma.testes.buscaativaescolar.org.br

## Partners > Sponsors and Operational 

* Fundo das Nações Unidas para a Infância (UNICEF)
* União Nacional dos Dirigentes Municipais de Educação (Undime)
* Colegiado Nacional de Gestores Municipais de Assistência Social (Congemas)
* Instituto TIM

## Partners > Builders

* La Fabbrica - http://lafabbrica.net/
* LQDI - https://lqdi.net/

## Reference
* http://www.foradaescolanaopode.org.br
* https://buscaativaescolar.org.br
* https://plataforma.buscaativaescolar.org.br
* https://alerta.buscaativaescolar.org.br


## License

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    
