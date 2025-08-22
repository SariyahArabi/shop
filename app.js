function doGet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
    if (!sheet) {
      throw new Error("Sheet 'Products' not found");
    }
    
    var data = sheet.getDataRange().getValues();
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        result.push({
          id: data[i][0],
          name: data[i][1],
          price: data[i][2],
          image: data[i][3],
          description: data[i][4]
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.message,
      details: "Check if sheet name is 'Products'"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
    if (!sheet) {
      throw new Error("Sheet 'Products' not found");
    }
    
    var body = JSON.parse(e.postData.contents);
    
    // إضافة منتج جديد
    sheet.appendRow([
      body.id || Utilities.getUuid(),
      body.name,
      body.price,
      body.image,
      body.description
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Product added successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
