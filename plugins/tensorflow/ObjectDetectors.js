module.exports = function(config){
  var tfjsSuffix = ''
  switch(config.tfjsBuild){
      case'gpu':
          tfjsSuffix = '-gpu'
      break;
      case'cpu':
      break;
      default:
          try{
              require(`@tensorflow/tfjs-node-gpu`)
              tfjsSuffix = '-gpu'
          }catch(err){
              console.log(err)
          }
      break;
  }

  var tf = require(`@tensorflow/tfjs-node${tfjsSuffix}`)
  const cocossd = require('@tensorflow-models/coco-ssd');
  // const mobilenet = require('@tensorflow-models/mobilenet');


  async function loadCocoSsdModal() {
      const modal = await cocossd.load({
          base: 'mobilenet_v2'
      })
      return modal;
  }

  // async function loadMobileNetModal() {
  //     const modal = await mobilenet.load({
  //         version: 1,
  //         alpha: 0.25 | .50 | .75 | 1.0,
  //     })
  //     return modal;
  // }

  function getTensor3dObject(numOfChannels,imageArray) {

      const tensor3d = tf.node.decodeJpeg( imageArray, numOfChannels );

      return tensor3d;
  }
  // const mobileNetModel =  this.loadMobileNetModal();
  var loadCocoSsdModel = {
      detect: function(){
          return {data:[]}
      }
  }
  async function init() {
      loadCocoSsdModel =  await loadCocoSsdModal();
  }
  init()
  return class ObjectDetectors {

      constructor(image, type) {
          this.startTime = new Date();
          this.inputImage = image;
          this.type = type;
      }

      async process() {
          const tensor3D = getTensor3dObject(3,(this.inputImage));
          let predictions = await loadCocoSsdModel.detect(tensor3D);

          tensor3D.dispose();

          return {
              data: predictions,
              type: this.type,
              time: new Date() - this.startTime
          }
      }
  }
}
