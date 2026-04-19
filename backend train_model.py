import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense

X = np.random.rand(500, 3)

input_layer = Input(shape=(3,))
encoded = Dense(2, activation="relu")(input_layer)
decoded = Dense(3, activation="sigmoid")(encoded)

autoencoder = Model(input_layer, decoded)
autoencoder.compile(optimizer='adam', loss='mse')

autoencoder.fit(X, X, epochs=10)

autoencoder.save("model.h5")
