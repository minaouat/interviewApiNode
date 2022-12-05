import axios from "axios";
import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  var name: string = request.params['name']

  reply.headers['Accept'] = 'application/json'

  var urlApiPokeman = `https://pokeapi.co/api/v2/pokemon/`;

  var params = {}

  name != null
      ? name.trim() != ''
      ? (params["name"] = name, urlApiPokeman = urlApiPokeman + name)
      : (urlApiPokeman = urlApiPokeman + '"?offset=20"', urlApiPokeman = urlApiPokeman + "&limit=20")
      : (urlApiPokeman = urlApiPokeman + '"?offset=20"', urlApiPokeman = urlApiPokeman + "&limit=20")

  //const http = require('https');
  //const keepAliveAgent = new http.Agent({ keepAlive: true });

  let response: any = ""

  //http.request({ ...reply.headers, ...({ hostname: urlApiPokeman, port: 80, }) }, (result) => { response = result })
  let res = await axios.get(urlApiPokeman, {
    headers: {Accept: 'application/json', 'Accept-Encoding': 'identity'},
    params: {trophies: true}
    });

   response = res.data;
    //console.log('responce : ',response);
  
  if (response == null) {
    reply.code(404)
  }

  response = await computeResponse(response, reply)
  //console.log('responce end : ',response);

  reply.send(response)
  return reply
}

export const computeResponse = async (response: any, reply: FastifyReply) => {
  const resp = response as any

  //console.log('resp.types :',resp.types);
  let UrlTypes: string[] = resp.types.map(type => type.type).map(type => type.url);

    //console.log('UrlTypes: ', UrlTypes);
    let pokemonTypes: any = []

    for (const url of UrlTypes) {
        // axios.request({hostname: url}, (response: any) => pokemonTypes.push(response))
        pokemonTypes.push((await axios.get(url, {
            headers: {Accept: 'application/json', 'Accept-Encoding': 'identity'},
            params: {trophies: true}
        })).data);
    }

  //console.log('pokemonTypes', pokemonTypes);
  if (pokemonTypes == undefined)
    throw pokemonTypes

  var stats = []
  stats = response.stats.map(stat =>stat.base_stat);

   response.stats.forEach(element => {
    if (stats) {
      let avg = stats.reduce((a, b) => a + b) / stats.length
      element.averageStat = avg
    } else {
      element.averageStat = 0
    }

  });
  return response;
}