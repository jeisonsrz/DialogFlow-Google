const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const admin=require('firebase-admin');
admin.initializeApp();
const firestore= admin.firestore();
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const ciudades= ['Bogotá','Cuidad de Mexico','Popayán'];
  const tematicas=['Inteligencia Artificial','Impresión 3D','IOT','React','Firebase'];
  
  const siguienteLive = {
  dia:'20 de Febrero',
  hora:'7 PM',
  tema: 'Como ser un desarrollador estrella'
  }
  
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function obtenerCuidad(agent){
    

  if(ciudades.includes(agent.parameters.ciudad)){

    const ssml = `<speak><audio src="http://www.sonidosmp3gratis.com/sounds/008829798_prev"></audio>Genial, te puedo ayudar a
    encontrar pláticas y talleres en tu ciudad 
    o eventos en linea. ¿Por cuál te gustaría empezar?</speak>`
      
    agent.add(ssml);
    
    agent.add(new Suggestion('Pláticas'));
    agent.add(new Suggestion('Talleres'));
    agent.add(new Suggestion('Platzi Lives'));
    
  }else{agent.add(`Oh, aún no hay meetups en tu cuidad
	pero el siguiente platzi live es el día ${siguienteLive.dia}
	a las ${siguienteLive.hora} y el tema es ${siguienteLive.tema}`)}
  }
  
  
  function detallePlatziLive(agent){
    /*  let nextPlatziLive = firestore.collection('platzi-lives').get().then(function(doc){

      }) */
  agent.add(`Oh, aún no hay meetups en tu cuidad
	pero el siguiente platzi live es el día ${siguienteLive.dia}
	a las ${siguienteLive.hora} y el tema es ${siguienteLive.tema}`);
  
  }
  
  function selecciondeTematica(agent){
    const ssml=`<speak>
    <p><s>¡Súper!</s> <s>a mi tambien me encantan los retos.</s>
	<s>Estos son los temas que se van a cubrir próximamente en tu ciudad:</s>
    ${tematicas.join('<break time="300ms"/>,')}. ¿Cuál te interesa más?</p>
    </speak>`

    let conv= agent.conv()
    conv.ask(ssml);
  agent.add(conv);
    
  for(let tematica of tematicas){
    agent.add(new Suggestion(tematica));
}


  }

  function selecciondeTematicaDeep(agent){
    agent.add(`Súper, a mi tambien me encantan los retos,
      estos son los temas que se van a cubrir próximamente en tu ciudad:
      ${tematicas.join(',')}. ¿Cuál te interesa más?`);
      
       for(let tematica of tematicas){
      agent.add(new Suggestion(tematica));
  }

    }

  function detalleTaller(agent){
  agent.add(`<speak>El sábado 20 de junio a las <say-as interpret-as="time" format="hms12">9:00 pm</say-as> tendremos un taller
	de Impresión 3D en las oficinas de Eureka! Technology. ¿Te gustaría asistir?</speak>`);
  
  }
  
  
function registroAlTaller(agent){
  agent.add(`<speak> Ok, solo falta un detalle técnico, para asistir debes registrarte
	en <sub alias="la plataforma de Meetup"> https://www.meetup.com/es/Platzi-Colombia/ </sub>..
	¿Te gustaría explorar algo más? ....solo Di: quiero información
de otra plática,taller o ver eventos en linea</speak>`);
  
  agent.add(new Card({
    title:'Registro en Meetup',
    imageUrl:'http://eurekatiendavirtual.com.co/wp-content/uploads/2015/05/PERFIL-FANPAGE-FACEBOOK-150x150.jpg',
    text: 'Registrare en Mettup, tambien puedes usar saltos de lines \n y hasta emojis 🚀',
    buttonText:'Registrarme',
    buttonUrl: 'https://www.meetup.com/es/Platzi-Colombia/',
  
  })
  );
  agent.setContext({name: 'registroAlTaller', lifespan:2 , parameters:{}});
  }
  

 
  
  
  let intentMap = new Map();
  intentMap.set('Obtener cuidad', obtenerCuidad);
  intentMap.set('Live', detallePlatziLive);
   intentMap.set('Talleres', selecciondeTematica);
   intentMap.set('Talleres - Deep Links', selecciondeTematicaDeep);
  intentMap.set('Seleccion de Taller', detalleTaller);
  intentMap.set('Seleccion de Taller - yes', registroAlTaller);
 
     agent.handleRequest(intentMap);
});