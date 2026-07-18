import importlib
m = importlib.import_module('app.services.flow_service')
print('Imported FlowGenerationService:', hasattr(m, 'FlowGenerationService'))
