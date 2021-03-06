# Installazione e avvio

## Requisiti

Installare il broker rabbitmq 

(su mac)

```bash
brew install rabbitmq
```

su ubuntu, andare sul sito di rabbimq https://www.rabbitmq.com , scaricare il deb e fare :

```bash
dpkg -i rabbitmq.deb
```

il nome ovviamente varierà.

Installare postfix

```bash
apt-get install postfix
```

Installarlo come sito internet, e inserire un FQDN valido

Dopodichè, andare sul file

```bash
/etc/postfix/master.cf
```

e modificare la porta di ascolto

dalla riga

```
smtpd      inet  n       -       y       -       -       smtpd
```

alla riga


```
9267      inet  n       -       y       -       -       smtpd
```

in questo modo avremo la porta 9267 in ascolto in localhost 


## Installazione

Clonare il progetto git con ```git clone``` e spostarsi all'interno della cartella

```bash
cd node-mailing-amqp
```

Installare le dipendenze richieste

```bash
npm install --production
```

Creare le cartelle dei log

```bash
./setup.sh
```

Assicurarsi di avere RabbitMQ server attivo, verificare anche che le configurazioni siano corrette in [config.json](./config.json).


### Esecuzione

Questo progetto è l'insieme di tre parti:

1. **Postfix SMTP server** . Questo è il servizio reale che invierà infine le mail, gira su localhost (porta 9267) e accetta mail solo da localhost.
2. **Processo Subscriber** ([subscriber.js](subscriber.js)). Questo processo è quello che si occupa di recuperare i messaggi dalla coda rabbit e mandarli in invio tramite postfix. Ogni fetch è temporizzato tramite il valore config.delaysend nel file config.json
3. **Processo Publisher** ([publisher.js](publisher.js)). Questo è l'smtp di ponte che si occupa di validare l'utente che sta inviando la mail, e inserisce la mail da recapitare in coda rabbit

Si possono avviare tutti i processi tramite il comando (all'interno della cartella)


```bash
./restart.sh
```

### Impostazione credenziali

Modificare il file [auth.json](auth.json) e aggiungere gli account che verranno utilizzati dal sistema

Esempio:

```json
{
	"users": [{
		"username": "test1",
		"password": "test1"
	}, {
		"username": "test2",
		"password": "test2"
	}, {
		"username": "test3",
		"password": "test3"
	}, {
		"username": "test4",
		"password": "test4"
	}, {
		"username": "test5",
		"password": "test5"
	}]
}
```



#### UTILITY 

```bash
rabbitmqctl list_queues
```

eliminare la coda rabbit

```bash
python rabbitmqadmin purge queue name=node-mailing-amqp
```


I logs sono all'interno della cartella ```LOGS```