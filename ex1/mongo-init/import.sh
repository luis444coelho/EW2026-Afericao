#!/bin/bash
set -e

mongoimport --host localhost --db autoRepair --collection repairs --type json --file /docker-entrypoint-initdb.d/dataset_reparacoes.json --jsonArray
