export default function useForecastLeafLet() {

  // Forecast: Devuelve
  const getForecastStyle = (forecast) => {
    let toxAForecastColor
    let analisisColor

    if (forecast) {
      forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets.map((forecastBucket) => {
        if (forecastBucket.name === 'ToxA-Forecast') {
          toxAForecastColor = forecastBucket.color
        }
        if (forecastBucket.name === 'Analisis') {
          analisisColor = forecastBucket.color
        }
      })
    }
    return {
      fillColor: toxAForecastColor || '#3388ff',
      color: analisisColor || '#fff8eb',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8,
    }
  }
  const featureHoverStyle = {
    //fillColor: '#a7c5f8',
    //color: '#448aff',
    fillColor: '#bdcdc7',
    color: '#016836',
    weight: 2,
  }

  // PMI Style
  const defaultStylePMI = {
    fillColor: '#448aff', // Si no se indica usa la propiedad color
    fillOpacity: 0,
    color: 'yellow',
    weight: 1,
    opacity: 1,
  }
  // eslint-disable-next-line no-unused-vars
  const getPMIStyle = (object) => {
    return defaultStylePMI
  }

  return {
    getForecastStyle,
    featureHoverStyle,

    // PMI styling
    getPMIStyle,
    defaultStylePMI,
  }
}
