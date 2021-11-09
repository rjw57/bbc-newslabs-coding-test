# Start from a known good version of node and sufficiently recent Debian slim.
FROM node:16-bullseye-slim

# Create a directory for the app owned by a non-privileged user.
WORKDIR /usr/src/app
RUN useradd --create-home --system nodeapp && chown -R nodeapp /usr/src/app

# Prepare for installation.
COPY --chown=nodeapp ./package.json ./package-lock.json ./

# _Empirically_ various apt packages are required for node-pre-gyp to be able to
# find and build sqlite. We install the apt packages, install npm dependencies
# and uninstall the apt packages in one go so as to minimise layer size.
#
# We keep the sqlite3 package installed because npm test uses it to populate the
# database.
RUN set -ex ;\
    apt-get update -y ;\
    apt-get install -y sqlite3 python3 python-is-python3 build-essential ;\
    apt-get clean -y ;\
    su nodeapp sh -c 'npm ci' ;\
    apt-get remove --purge -y python3 python-is-python3 build-essential ;\
    apt-get autoremove --purge -y

# Continue as the unprivileged user.
USER nodeapp

# Copy the application itself.
COPY --chown=nodeapp ./ ./

# Default entrypoint is to start the application on port 8080.
EXPOSE 8080
ENTRYPOINT ["npm", "start"]
