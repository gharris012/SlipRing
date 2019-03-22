
include("common.jscad");
include("screws.jscad");

// 13.9 - a little loose, use for fit testing the rest
// 14.20 - 'prod'
const ringOD = 13.9; 
// 8.10 - a little loose, use for fit testing the rest
// 8.00 - 'prod'
const ringID = 8.10;
const ringWidth = 10;

const ringSlotDia = 12;
const ringSlotDepth = 1.5;

const ringToolOD = ringOD + 4;
const ringToolID = ringID + 3;
const ringToolLength = 55;

const spacerOD = ringOD + 2;
const spacerThickness = 2;

const solderGrooveDia = 5;
const wireGrooveDia = 5;

const tol = 0.25;

function getParameterDefinitions()
{
  return [
    { name: 'showReferences', type: 'choice', values: ["yes", "no"], initial: "no", caption: "Show References?" },
    { name: 'type', type: 'choice', values: 
        [
          "ring",
          "washer", 
          "spacer", 
          "ring w/spacer", 
          "ring tool",
          "slip",
          "slip w/bearing",
          "end"
        ], 
        initial: "slip", caption: "Type" }
  ];
}

function main(params)
{
  let output = [];
  // Axis
  if ( params.showReferences === 'yes' )
  {
      output.push(makeAxis());
  }

  if ( params.type === 'slip' || params.type === 'slip w/bearing' || params.type === 'end' )
  {
    output = output.concat(slip());
  }
  else if ( params.type === 'washer' )
  {
    const washer = CSG.cylinder({
      start: [0,0, 0],
      end:   [0,0, spacerThickness],
      radius: ( ( ringID + ( tol * 2 ) ) / 2 ) + 1
    });
    const washerHole = CSG.cylinder({
      start: [0,0, 0],
      end:   [0,0, spacerThickness],
      radius: ( ringID + ( tol * 2 ) ) / 2
    });
    output = washer.subtract(washerHole);
  }
  else
  {
    output = output.concat(ring());
  }

  return output;
}

function slip()
{
  let output = [];


  const brushMountDia = 5;
  const brushMountBackX = 5;
  const brushMountBackY = 2.5;
  const brushMountZ = 7;
  const brushContactX = 3.5;  // 3x0.6
  const brushContactY = 1.0;
  const brushMountHoleDia = 2;

  let brushMount = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, brushMountZ],
    radius: ( brushMountDia ) / 2
  });
  let brushMountHole = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, brushMountZ],
    radius: ( brushMountHoleDia ) / 2
  });
  let brushMountBack = CSG.roundedCube({
    center: [0, 0, brushMountZ/2],
    radius: [brushMountBackX/2, brushMountBackY/2, brushMountZ/2],
    roundradius: 0
  }).translate([0, -brushMountDia/2, 0]);
  
  brushMount = brushMount.subtract(brushMountBack);
  brushMount = brushMount.union(brushMountBack.translate([0, brushMountBackY/2, 0])
  .translate([0, 0.5, 0]));
  brushMount = brushMount.subtract(brushMountHole);

  //output.push(brushMount);


  // reference dimensions (from motor)
  // shaft diameter (commutator, from motor) : 5.75
  // distance between brush mounts: 18
  // distance between mount and shaft: 12.25
  //
  // new dimensions
  // ring dia: 16

  // distance between mounts: 28.25
  // 

  const brushSpacing = 27;
  const slipDia = brushSpacing + brushMountDia;
  const slipRefDia = slipDia + brushContactY;
  let slipRefZ = spacerThickness;
  let slipZ = ringWidth;
  const ringRefDia = 16 + 1;
  const bearingDia = 22;
  const bearingZ = 7;
  const slipWallDia = slipRefDia + 3;

  const brushContactZ = brushMountZ;
  let brushContact = CSG.roundedCube({
    center: [0, 0, brushContactZ/2],
    radius: [brushContactX/2, brushContactY/2, brushContactZ/2],
    roundradius: 0
  });
 
  const brushContactUpperX = 6;
  const brushContactUpperY = brushContactY;
  const brushContactUpperZ = slipZ;
  let brushContactUpper = CSG.roundedCube({
    center: [0, 0, brushContactUpperZ/2],
    radius: [brushContactUpperX/2, brushContactUpperY/2, brushContactUpperZ/2],
    roundradius: 0
  })
  .translate([-(brushContactX-brushContactUpperX)/2,0,0]);
 
  const brushContactLowerZ = brushMountZ + 1;
  const brushContactLowerY = slipWallDia - slipRefDia;
  let brushContactLower = CSG.roundedCube({
    center: [0, -brushContactLowerY/2, -brushContactLowerZ/2],
    radius: [brushContactX/2, brushContactLowerY/2, brushContactLowerZ/2],
    roundradius: 0
  });
  brushContact = brushContact.union(brushContactLower).union(brushContactUpper);

  let bearingMount = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, -bearingZ],
    radius: ( bearingDia + 1 + 4 ) / 2
  });
  const bearingHole = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, -bearingZ],
    radius: ( bearingDia + 1 ) / 2
  });
  bearingMount = bearingMount.subtract(bearingHole);
  let bearingMountTab = makeMountTab().rotateZ(90).translate([((bearingDia + 1 + 4)/2) + 6.5, 0, -bearingZ]);
  bearingMount = bearingMount.union(bearingMountTab.rotateZ(-45));
  bearingMount = bearingMount.union(bearingMountTab.rotateZ(180-45));

  if ( params.type === 'slip w/bearing' )
  {
    output.push(bearingMount);
  }

  if ( params.type === 'end' )
  {
    slipZ = 0;
  }

  let slipWall = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, slipZ + slipRefZ],
    radius: ( slipWallDia ) / 2
  });
  let slipWallHole = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, slipZ + slipRefZ],
    radius: ( slipRefDia ) / 2
  });
  slipWall = slipWall.subtract(slipWallHole);
  output.push(slipWall);

  let mountTab = makeMountTab();
  let mountTabLow = mountTab.rotateZ(90).translate([(slipWallDia/2) + 3, 0, 0]);
  mountTabHigh = mountTabLow.translate([0, 0, slipZ]).rotateZ(0);
  mountTabLow = mountTabLow.rotateZ(45);
  mountTab = [ mountTabHigh, mountTabHigh.rotateZ(180) ];

  if ( params.type !== 'slip w/bearing'
        && params.type !== 'end' )
  {
    mountTab.push(mountTabLow);
    mountTab.push(mountTabLow.rotateZ(90));
    mountTab.push(mountTabLow.rotateZ(180));
    mountTab.push(mountTabLow.rotateZ(270));
  }
  mountTab = union(mountTab);
  mountTab = mountTab.subtract(slipWallHole);
  
  output.push(mountTab);

  let slipRef = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, slipRefZ],
    radius: ( slipRefDia ) / 2
  });

  let slipAxleHoleDia = bearingDia;

  if ( params.type === 'slip w/bearing' )
  {
    slipAxleHoleDia = bearingDia - 4;
  }
  else if ( params.type === 'end' )
  {
    slipAxleHoleDia = spacerOD + 3;
  }

  let ringRef = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, slipRefZ],
    radius: ( slipAxleHoleDia / 2 ) // axle size without touching
  });
  output.push(slipRef.subtract(ringRef));
  if ( params.type !== 'end' )
  {
    output.push(brushMount.translate([0, -brushSpacing/2, slipRefZ]));
  }
  let slipBody = union(output);
  if ( params.type !== 'end' )
  {
    slipBody = slipBody.subtract(brushContact.translate([0, -((brushSpacing/2) + (brushMountDia/2)), slipRefZ]));
  }
  output = [ slipBody ];
  
  return output;
}

function makeMountTab()
{
  const mountTabDia = 7;
  const mountTabHoleDia = 3.25;
  const mountTabZ = spacerThickness;

  let mountTab = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, mountTabZ],
    radius: ( mountTabDia ) / 2
  });
  let mountTabBack = CSG.roundedCube({
    center: [0, 0, mountTabZ/2],
    radius: [mountTabDia/2, mountTabDia/2, mountTabZ/2],
    roundradius: 0
  }).translate([0, mountTabDia/2, 0]);
  mountTab = mountTab.union(mountTabBack);
  let mountTabHole = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, mountTabZ],
    radius: ( mountTabHoleDia ) / 2
  });
  mountTab = mountTab.subtract(mountTabHole);

  return mountTab;
}

function ring()
{
  let output = [];
  let ringBody = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, ringWidth],
    radius: ( ringOD - tol ) / 2
  });
  const innerRing = CSG.cylinder({
    start: [0,0,-(spacerThickness)],
    end:   [0,0, ringWidth],
    radius: ( ringID + tol ) / 2
  });
  ringBody = ringBody.subtract(innerRing);
  const ringSlot = CSG.cylinder({
    start: [0,0, ringWidth - ringSlotDepth],
    end:   [0,0, ringWidth],
    radius: ringSlotDia / 2
  });
  ringBody = ringBody.subtract(ringSlot.translate([ringID / 2, ringID / 2, 0]));
  ringBody = ringBody.subtract(ringSlot.translate([-ringID / 2, -ringID / 2, 0]));

  const solderGroove = CSG.cylinder({
    start: [0,0,-(spacerThickness)],
    end:   [0,0, ringWidth],
    radius: ( solderGrooveDia ) / 2
  });
  ringBody = ringBody.subtract(solderGroove.translate([( ringOD/2 ) + (1/2), 0, 0]));
  ringBody = ringBody.subtract(solderGroove.translate([-(( ringOD/2 ) + (1/2)), 0, 0]));
  
  const wireGroove = CSG.cylinder({
    start: [0,0,-(spacerThickness)],
    end:   [0,0, ringWidth],
    radius: ( wireGrooveDia ) / 2
  });
  ringBody = ringBody.subtract(wireGroove.translate([0, -( ringID/2 ), 0]));
  ringBody = ringBody.subtract(wireGroove.translate([0, ( ringID/2 ), 0]));
  output.push(ringBody);

  // ring spacers
  let spacer = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0, -(spacerThickness)],
    radius: ( spacerOD ) / 2
  });
  spacer = spacer.subtract(innerRing);
  spacer = spacer.subtract(wireGroove.translate([0, -( ringID/2 ), 0]));
  spacer = spacer.subtract(wireGroove.translate([0, ( ringID/2 ), 0]));
  if ( params.type === 'spacer' )
  {
    output = spacer;
  }
  else if ( params.type === 'ring w/spacer' )
  {
    output.push(spacer);
  }
  else if ( params.type === 'ring tool' )
  {
    let tool = CSG.cylinder({
      start: [0,0,0],
      end:   [0,0, ringToolLength],
      radius: ( ringToolOD ) / 2
    });
    const innerTool = CSG.cylinder({
      start: [0,0,0],
      end:   [0,0, ringToolLength],
      radius: ( ringToolID ) / 2
    });
    tool = tool.subtract(innerTool);
    output = tool;
  }

  return union(output);
}
